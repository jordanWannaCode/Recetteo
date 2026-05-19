import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeService, ingredientService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MEASUREMENT_UNITS } from '../../utils/measurementUnits';
import {
  Box, Container, Typography, Button, Grid, TextField, Card, CardContent,
  CardHeader, IconButton, Autocomplete, FormControlLabel,
  Switch, Paper, Stack, CircularProgress, InputAdornment, Alert
} from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';

const normalizePrice = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const RECIPE_DRAFT_KEY = 'recipe_draft_v1';
const MAX_RECIPE_IMAGE_SIZE = 1024 * 1024;

const splitMinutes = (totalMinutes) => {
  if (!Number.isFinite(totalMinutes)) {
    return { hours: 0, minutes: 0 };
  }

  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  return {
    hours: Math.floor(safeMinutes / 60),
    minutes: safeMinutes % 60
  };
};

const toTotalMinutes = (hoursValue, minutesValue) => {
  const hours = Number.isFinite(Number(hoursValue)) ? Number(hoursValue) : 0;
  const minutes = Number.isFinite(Number(minutesValue)) ? Number(minutesValue) : 0;
  return Math.max(0, Math.round(hours) * 60 + Math.round(minutes));
};

const readDraft = () => {
  const raw = localStorage.getItem(RECIPE_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(RECIPE_DRAFT_KEY);
    return null;
  }
};

const writeDraft = (values) => {
  const payload = {
    values,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(RECIPE_DRAFT_KEY, JSON.stringify(payload));
};

const clearDraft = () => {
  localStorage.removeItem(RECIPE_DRAFT_KEY);
};

const timeNumber = yup
  .number()
  .transform((value, originalValue) => (originalValue === '' || originalValue === null ? 0 : value))
  .typeError('Veuillez entrer un nombre valide')
  .integer('Veuillez entrer un nombre entier')
  .min(0, 'Le temps doit être positif')
  .required();

const schema = yup.object().shape({
  nom: yup.string().required('Le nom est requis').max(120),
  description: yup.string().required('La description est requise'),
  temps_preparation_heures: timeNumber,
  temps_preparation_minutes: timeNumber
    .max(59, 'Les minutes doivent être entre 0 et 59')
    .test('prep-total', 'Le temps de préparation est requis', function (value) {
      const hours = Number(this.parent.temps_preparation_heures || 0);
      const minutes = Number(value || 0);
      return hours + minutes > 0;
    }),
  temps_cuisson_heures: timeNumber,
  temps_cuisson_minutes: timeNumber.max(59, 'Les minutes doivent être entre 0 et 59'),
  est_publique: yup.boolean(),
  ingredients: yup.array().of(
    yup.object().shape({
      id: yup.number().nullable(),
      nom: yup.string().when('id', {
        is: (value) => !value,
        then: (schema) => schema.required('Le nom est requis'),
        otherwise: (schema) => schema.optional()
      }),
      unite: yup.string().when('id', {
        is: (value) => !value,
        then: (schema) => schema.required('L\'unité est requise'),
        otherwise: (schema) => schema.optional()
      }),
      prix_unitaire: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
        .nullable()
        .min(0, 'Le prix doit être positif')
        .typeError('Veuillez entrer un nombre valide'),
      quantite: yup.number().required().positive(),
    })
  ).min(1, 'Au moins un ingrédient est requis'),
});

const RecipeFormPage = ({ edit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [draftStatus, setDraftStatus] = useState(edit ? 'disabled' : 'loading');
  const [draftPayload, setDraftPayload] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [addingIngredient, setAddingIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    nom: '',
    unite: '',
    prix_unitaire: '',
    quantite: 1
  });
  const [newIngredientError, setNewIngredientError] = useState('');
  const unitOptions = MEASUREMENT_UNITS;
  const draftUpdatedAt = draftPayload?.updatedAt
    ? new Date(draftPayload.updatedAt).toLocaleString()
    : null;
  
  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nom: '',
      description: '',
      temps_preparation_heures: 0,
      temps_preparation_minutes: 0,
      temps_cuisson_heures: 0,
      temps_cuisson_minutes: 0,
      est_publique: false,
      ingredients: [],
    }
  });

  const recipeIngredients = watch('ingredients');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger la liste des ingrédients
        const ingredientsResponse = await ingredientService.getAll();
        setIngredients(ingredientsResponse.data);
        
        // Si en mode édition, charger la recette existante
        if (edit && id) {
          const recipeResponse = await recipeService.getById(id);
          const recipe = recipeResponse.data;
          
          // Vérifier que l'utilisateur est l'auteur
          if (recipe.utilisateur_id !== user?.id) {
            navigate('/recettes');
            return;
          }
          
          const prepSplit = splitMinutes(recipe.temps_preparation);
          const cuissonSplit = splitMinutes(recipe.temps_cuisson);

          // Pré-remplir le formulaire
          reset({
            nom: recipe.nom,
            description: recipe.description,
            temps_preparation_heures: prepSplit.hours,
            temps_preparation_minutes: prepSplit.minutes,
            temps_cuisson_heures: cuissonSplit.hours,
            temps_cuisson_minutes: cuissonSplit.minutes,
            est_publique: recipe.est_publique,
            ingredients: recipe.ingredients.map(ing => ({
              id: ing.id,
              quantite: ing.quantite,
              nom: ing.nom,
              unite: ing.unite
            }))
          });
          setExistingImage(recipe.image || '');
          setImagePreview(recipe.image || '');
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [edit, id, reset, user, navigate]);

  useEffect(() => {
    if (edit) {
      setDraftStatus('disabled');
      return;
    }

    const storedDraft = readDraft();
    if (storedDraft?.values) {
      setDraftPayload(storedDraft);
      setDraftStatus('ready');
    } else {
      setDraftStatus('active');
    }
  }, [edit]);

  useEffect(() => {
    if (edit || draftStatus !== 'active' || submitting) return;

    let timeoutId = null;
    const subscription = watch((values) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        writeDraft(values);
      }, 400);
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [watch, edit, draftStatus, submitting]);

  useEffect(() => {
    if (!imageFile) return;
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Veuillez selectionner une image valide.');
      setImageFile(null);
      setImagePreview(existingImage || '');
      return;
    }

    if (file.size > MAX_RECIPE_IMAGE_SIZE) {
      setImageError('Image trop lourde (1 Mo max).');
      setImageFile(null);
      setImagePreview(existingImage || '');
      return;
    }

    setImageError('');
    setImageFile(file);
  };

  const handleImageClear = () => {
    setImageFile(null);
    setImageError('');
    setImagePreview(existingImage || '');
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitting(true);

      const preparationMinutes = toTotalMinutes(
        data.temps_preparation_heures,
        data.temps_preparation_minutes
      );
      const cuissonMinutes = toTotalMinutes(
        data.temps_cuisson_heures,
        data.temps_cuisson_minutes
      );

      const existingIngredients = data.ingredients.filter((ingredient) => ingredient.id);
      const newIngredients = data.ingredients.filter((ingredient) => !ingredient.id);

      const createdIngredients = await Promise.all(
        newIngredients.map(async (ingredient) => {
          const payload = {
            nom: ingredient.nom.trim(),
            unite: ingredient.unite.trim()
          };
          const price = normalizePrice(ingredient.prix_unitaire);
          if (price !== null) {
            payload.prix_unitaire = price;
          }

          const response = await ingredientService.create(payload);
          return {
            ...ingredient,
            id: response.data.id
          };
        })
      );

      const {
        temps_preparation_heures,
        temps_preparation_minutes,
        temps_cuisson_heures,
        temps_cuisson_minutes,
        ...rest
      } = data;
      const formattedData = {
        ...rest,
        temps_preparation: preparationMinutes,
        temps_cuisson: cuissonMinutes,
        ingredients: [...existingIngredients, ...createdIngredients].map((ingredient) => ({
          id: ingredient.id,
          quantite: ingredient.quantite
        }))
      };
      
      let recipeId = id;
      if (edit && id) {
        await recipeService.update(id, formattedData);
      } else {
        const response = await recipeService.create(formattedData);
        recipeId = response.data?.recette?.id;
        clearDraft();
      }

      if (imageFile && recipeId) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          await recipeService.uploadImage(recipeId, formData);
        } catch (error) {
          const message = error.response?.data?.message || "Recette enregistree, mais l'image n'a pas pu etre envoyee.";
          setSubmitError(message);
          return;
        }
      }

      navigate('/recettes');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 401 || status === 422) {
        setSubmitError('Votre session a expire, reconnectez-vous puis reessayez.');
      } else if (status === 400 && message) {
        setSubmitError(message);
      } else {
        setSubmitError(message || "Impossible d'enregistrer la recette.");
      }
      console.error('Failed to submit recipe', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddIngredient = (ingredient, quantity = 1) => {
    if (!ingredient) return;

    const alreadyAdded = recipeIngredients.some((item) =>
      (item.id && item.id === ingredient.id) ||
      (item.nom && item.nom.toLowerCase() === ingredient.nom.toLowerCase())
    );

    if (alreadyAdded) return;
    
    setValue('ingredients', [
      ...recipeIngredients,
      {
        id: ingredient.id,
        nom: ingredient.nom,
        unite: ingredient.unite,
        quantite: quantity
      }
    ]);
  };

  const getIngredientKey = (ingredient) => ingredient.id ?? ingredient.tempId;

  const handleRemoveIngredient = (ingredientKey) => {
    setValue(
      'ingredients',
      recipeIngredients.filter((ingredient) => getIngredientKey(ingredient) !== ingredientKey)
    );
  };

  const handleQuantityChange = (ingredientKey, value) => {
    setValue(
      'ingredients',
      recipeIngredients.map((ingredient) =>
        getIngredientKey(ingredient) === ingredientKey ? { ...ingredient, quantite: value } : ingredient
      )
    );
  };

  const handleAddNewIngredient = async () => {
    const nom = newIngredient.nom.trim();
    const unite = newIngredient.unite.trim();
    const quantite = Number(newIngredient.quantite);
    setNewIngredientError('');

    if (!nom || !unite || !Number.isFinite(quantite) || quantite <= 0) {
      setNewIngredientError('Le nom, l\'unité et la quantité sont requis pour ajouter un ingrédient.');
      return;
    }

    const existing = ingredients.find(
      (ingredient) => ingredient.nom.toLowerCase() === nom.toLowerCase()
    );

    if (existing) {
      handleAddIngredient(existing, quantite);
      setNewIngredient({ nom: '', unite: '', prix_unitaire: '', quantite: 1 });
      setNewIngredientError('');
      return;
    }

    const alreadyAdded = recipeIngredients.some(
      (ingredient) => ingredient.nom && ingredient.nom.toLowerCase() === nom.toLowerCase()
    );

    if (alreadyAdded) {
      setNewIngredientError('Cet ingrédient est déjà ajouté.');
      return;
    }

    try {
      setAddingIngredient(true);
      const payload = {
        nom,
        unite
      };
      const price = normalizePrice(newIngredient.prix_unitaire);
      if (price !== null) {
        payload.prix_unitaire = price;
      }

      const response = await ingredientService.create(payload);
      const createdIngredient = response.data;

      setIngredients((prev) =>
        [...prev, createdIngredient].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
      );
      handleAddIngredient(createdIngredient, quantite);
      setNewIngredient({ nom: '', unite: '', prix_unitaire: '', quantite: 1 });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        setNewIngredientError("Votre session a expire, reconnectez-vous puis reessayez.");
        return;
      }

      if (error.response?.status === 409) {
        try {
          const refreshed = await ingredientService.getAll();
          const updatedList = refreshed.data || [];
          setIngredients(updatedList);
          const match = updatedList.find(
            (ingredient) => ingredient.nom.toLowerCase() === nom.toLowerCase()
          );
          if (match) {
            handleAddIngredient(match, quantite);
            setNewIngredient({ nom: '', unite: '', prix_unitaire: '', quantite: 1 });
            return;
          }
        } catch (refreshError) {
          console.error('Failed to refresh ingredients', refreshError);
        }
      }
      setNewIngredientError(error.response?.data?.message || "Impossible d'ajouter l'ingrédient.");
    } finally {
      setAddingIngredient(false);
    }
  };

  const handleResumeDraft = () => {
    if (!draftPayload?.values) return;
    reset(draftPayload.values);
    setDraftStatus('active');
    setDraftPayload(null);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setDraftStatus('active');
    setDraftPayload(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/recettes')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {edit ? 'Modifier la recette' : 'Nouvelle recette'}
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {draftStatus === 'ready' && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button color="inherit" size="small" onClick={handleResumeDraft}>
                    Reprendre
                  </Button>
                  <Button color="inherit" size="small" onClick={handleDiscardDraft}>
                    Supprimer
                  </Button>
                </Stack>
              }
            >
              {`Un brouillon est disponible${draftUpdatedAt ? ` (dernier enregistrement : ${draftUpdatedAt})` : ''}.`}
            </Alert>
          )}
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Informations de base" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="nom"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Nom de la recette"
                            error={!!errors.nom}
                            helperText={errors.nom?.message}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            error={!!errors.description}
                            helperText={errors.description?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Image de la recette
                      </Typography>
                      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}>
                        <Box
                          sx={{
                            width: 160,
                            height: 120,
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            backgroundColor: 'background.paper'
                          }}
                        >
                          {imagePreview ? (
                            <Box
                              component="img"
                              src={imagePreview}
                              alt="Apercu recette"
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Aucune image
                            </Typography>
                          )}
                        </Box>
                        <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                          <Button variant="outlined" component="label">
                            Choisir une image
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleImageSelect}
                            />
                          </Button>
                          {(imagePreview || imageFile) && (
                            <Button variant="text" color="error" onClick={handleImageClear}>
                              Retirer
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                      {imageError && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                          {imageError}
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Temps de préparation
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Controller
                          name="temps_preparation_heures"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              type="number"
                              label="Heures"
                              error={!!errors.temps_preparation_heures}
                              helperText={errors.temps_preparation_heures?.message}
                              inputProps={{ min: 0, step: 1 }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">h</InputAdornment>
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="temps_preparation_minutes"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              type="number"
                              label="Minutes"
                              error={!!errors.temps_preparation_minutes}
                              helperText={errors.temps_preparation_minutes?.message}
                              inputProps={{ min: 0, max: 59, step: 1 }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">min</InputAdornment>
                              }}
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Temps de cuisson
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Controller
                          name="temps_cuisson_heures"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              type="number"
                              label="Heures"
                              error={!!errors.temps_cuisson_heures}
                              helperText={errors.temps_cuisson_heures?.message}
                              inputProps={{ min: 0, step: 1 }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">h</InputAdornment>
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="temps_cuisson_minutes"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              type="number"
                              label="Minutes"
                              error={!!errors.temps_cuisson_minutes}
                              helperText={errors.temps_cuisson_minutes?.message}
                              inputProps={{ min: 0, max: 59, step: 1 }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">min</InputAdornment>
                              }}
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="est_publique"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Rendre cette recette publique"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Ingrédients" />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Autocomplete
                      options={ingredients}
                      getOptionLabel={(option) => option.nom}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Ajouter un ingrédient" 
                          variant="outlined" 
                        />
                      )}
                      onChange={(event, value) => handleAddIngredient(value)}
                    />
                  </Box>

                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Ajouter un nouvel ingrédient
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Nom"
                        value={newIngredient.nom}
                        onChange={(event) =>
                          setNewIngredient((prev) => ({ ...prev, nom: event.target.value }))
                        }
                        size="small"
                        fullWidth
                      />
                      <Autocomplete
                        freeSolo
                        options={unitOptions}
                        value={newIngredient.unite}
                        onChange={(event, value) =>
                          setNewIngredient((prev) => ({ ...prev, unite: value || '' }))
                        }
                        onInputChange={(event, value) =>
                          setNewIngredient((prev) => ({ ...prev, unite: value }))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Unité de mesure"
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                      <TextField
                        label="Prix unitaire (€) (optionnel)"
                        type="number"
                        size="small"
                        inputProps={{ step: "0.01", min: "0" }}
                        value={newIngredient.prix_unitaire}
                        onChange={(event) =>
                          setNewIngredient((prev) => ({ ...prev, prix_unitaire: event.target.value }))
                        }
                        fullWidth
                      />
                      <TextField
                        label="Quantité"
                        type="number"
                        size="small"
                        inputProps={{ step: "0.1", min: "0.1" }}
                        value={newIngredient.quantite}
                        onChange={(event) => {
                          const parsed = parseFloat(event.target.value);
                          setNewIngredient((prev) => ({
                            ...prev,
                            quantite: Number.isNaN(parsed) ? '' : parsed
                          }));
                        }}
                        fullWidth
                      />
                      {newIngredientError && (
                        <Typography color="error" variant="body2">
                          {newIngredientError}
                        </Typography>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddNewIngredient}
                        disabled={addingIngredient}
                      >
                        {addingIngredient ? 'Ajout en cours...' : "Ajouter l'ingrédient"}
                      </Button>
                    </Stack>
                  </Paper>
                  
                  {errors.ingredients && (
                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                      {errors.ingredients.message}
                    </Typography>
                  )}
                  
                  <Stack spacing={2}>
                    {recipeIngredients.map((ingredient) => (
                      <Paper 
                        key={getIngredientKey(ingredient)} 
                        variant="outlined" 
                        sx={{ p: 2, position: 'relative' }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{ingredient.nom}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveIngredient(getIngredientKey(ingredient))}
                            sx={{ position: 'absolute', top: 4, right: 4 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <TextField
                            type="number"
                            size="small"
                            value={ingredient.quantite}
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value);
                              handleQuantityChange(
                                getIngredientKey(ingredient),
                                Number.isNaN(parsed) ? '' : parsed
                              );
                            }}
                            sx={{ width: 80, mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {ingredient.unite}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                  disabled={submitting}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {edit ? 'Mettre à jour' : 'Créer la recette'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </motion.div>
    </Container>
  );
};

export default RecipeFormPage;
