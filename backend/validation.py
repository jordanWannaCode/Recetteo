import re
from typing import Any


class ValidationError(ValueError):
    pass


USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,30}$")
EMAIL_RE = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$")
SAFE_NAME_RE = re.compile(r"^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\s'(),._:-]{0,119}$")
SAFE_UNIT_RE = re.compile(r"^[A-Za-zÀ-ÿ0-9/%.\-\s]{1,20}$")
SAFE_TEXT_RE = re.compile(r"^[A-Za-zÀ-ÿŒœ0-9\s.,;:!?()'\"%+\-_/&’“”°€–—]{1,2000}$")
PASSWORD_RE = re.compile(r"^.{8,128}$")


def get_json_object(payload: Any) -> dict:
    if not isinstance(payload, dict):
        raise ValidationError("Le corps de la requete doit etre un objet JSON valide")
    return payload


def _get_string(
    data: dict,
    field: str,
    *,
    required: bool = True,
    min_len: int = 1,
    max_len: int = 255,
    pattern: re.Pattern[str] | None = None,
    normalize_lower: bool = False,
) -> str | None:
    value = data.get(field)

    if value is None:
        if required:
            raise ValidationError(f"Le champ {field} est requis")
        return None

    if not isinstance(value, str):
        raise ValidationError(f"Le champ {field} doit etre une chaine")

    cleaned = value.strip()
    if normalize_lower:
        cleaned = cleaned.lower()

    if len(cleaned) < min_len or len(cleaned) > max_len:
        raise ValidationError(f"Le champ {field} est invalide")

    if pattern and not pattern.fullmatch(cleaned):
        raise ValidationError(f"Le champ {field} contient des caracteres non autorises")

    return cleaned


def _get_password(data: dict, field: str) -> str:
    value = _get_string(data, field, min_len=8, max_len=128)
    if not PASSWORD_RE.fullmatch(value):
        raise ValidationError(
            "Le mot de passe doit contenir au moins 8 caracteres"
        )
    return value


def _get_int(
    data: dict,
    field: str,
    *,
    required: bool = True,
    minimum: int | None = None,
    maximum: int | None = None,
) -> int | None:
    value = data.get(field)

    if value is None:
        if required:
            raise ValidationError(f"Le champ {field} est requis")
        return None

    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise ValidationError(f"Le champ {field} doit etre un entier")

    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValidationError(f"Le champ {field} doit etre un entier") from None

    if isinstance(value, float) and not value.is_integer():
        raise ValidationError(f"Le champ {field} doit etre un entier")

    if minimum is not None and parsed < minimum:
        raise ValidationError(f"Le champ {field} est trop petit")

    if maximum is not None and parsed > maximum:
        raise ValidationError(f"Le champ {field} est trop grand")

    return parsed


def _get_float(
    data: dict,
    field: str,
    *,
    required: bool = True,
    minimum: float | None = None,
    maximum: float | None = None,
) -> float | None:
    value = data.get(field)

    if value is None:
        if required:
            raise ValidationError(f"Le champ {field} est requis")
        return None

    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise ValidationError(f"Le champ {field} doit etre numerique")

    try:
        parsed = float(value)
    except (TypeError, ValueError):
        raise ValidationError(f"Le champ {field} doit etre numerique") from None

    if minimum is not None and parsed < minimum:
        raise ValidationError(f"Le champ {field} est trop petit")

    if maximum is not None and parsed > maximum:
        raise ValidationError(f"Le champ {field} est trop grand")

    return parsed


def _get_bool(data: dict, field: str, *, required: bool = True) -> bool | None:
    value = data.get(field)

    if value is None:
        if required:
            raise ValidationError(f"Le champ {field} est requis")
        return None

    if not isinstance(value, bool):
        raise ValidationError(f"Le champ {field} doit etre un booleen")

    return value


def validate_register_payload(payload: Any) -> dict:
    data = get_json_object(payload)
    return {
        "nom_utilisateur": _get_string(data, "nom_utilisateur", min_len=3, max_len=30, pattern=USERNAME_RE),
        "email": _get_string(data, "email", min_len=6, max_len=120, pattern=EMAIL_RE, normalize_lower=True),
        "mot_de_passe": _get_password(data, "mot_de_passe"),
    }


def validate_login_payload(payload: Any) -> dict:
    data = get_json_object(payload)
    return {
        "email": _get_string(data, "email", min_len=6, max_len=120, pattern=EMAIL_RE, normalize_lower=True),
        "mot_de_passe": _get_string(data, "mot_de_passe", min_len=8, max_len=128),
    }


def validate_profile_payload(payload: Any, *, partial: bool = False) -> dict:
    data = get_json_object(payload)
    validated: dict[str, Any] = {}

    if not partial or "nom_utilisateur" in data:
        validated["nom_utilisateur"] = _get_string(
            data, "nom_utilisateur", required=not partial, min_len=3, max_len=30, pattern=USERNAME_RE
        )
    if not partial or "email" in data:
        validated["email"] = _get_string(
            data, "email", required=not partial, min_len=6, max_len=120, pattern=EMAIL_RE, normalize_lower=True
        )

    return {key: value for key, value in validated.items() if value is not None}


def validate_password_change_payload(payload: Any) -> dict:
    data = get_json_object(payload)
    return {
        "currentPassword": _get_string(data, "currentPassword", min_len=8, max_len=128),
        "newPassword": _get_password(data, "newPassword"),
    }


def validate_ingredient_payload(payload: Any, *, partial: bool = False) -> dict:
    data = get_json_object(payload)
    validated: dict[str, Any] = {}

    if not partial or "nom" in data:
        validated["nom"] = _get_string(data, "nom", required=not partial, min_len=2, max_len=120, pattern=SAFE_NAME_RE)
    if not partial or "unite" in data:
        validated["unite"] = _get_string(data, "unite", required=not partial, min_len=1, max_len=20, pattern=SAFE_UNIT_RE)
    if not partial or "prix_unitaire" in data:
        validated["prix_unitaire"] = _get_float(data, "prix_unitaire", required=False, minimum=0.0, maximum=100000.0)

    return {key: value for key, value in validated.items() if value is not None}


def validate_recipe_ingredients(items: Any) -> list[dict]:
    if not isinstance(items, list):
        raise ValidationError("Le champ ingredients doit etre une liste")

    validated_items = []
    for item in items:
        item_data = get_json_object(item)
        validated_items.append(
            {
                "id": _get_int(item_data, "id", minimum=1, maximum=10_000_000),
                "quantite": _get_float(item_data, "quantite", minimum=0.01, maximum=100000.0),
            }
        )

    return validated_items


def validate_recipe_payload(payload: Any, *, partial: bool = False) -> dict:
    data = get_json_object(payload)
    validated: dict[str, Any] = {}

    if not partial or "nom" in data:
        validated["nom"] = _get_string(data, "nom", required=not partial, min_len=2, max_len=120, pattern=SAFE_NAME_RE)
    if not partial or "description" in data:
        validated["description"] = _get_string(
            data, "description", required=not partial, min_len=5, max_len=2000, pattern=SAFE_TEXT_RE
        )
    if not partial or "temps_preparation" in data:
        validated["temps_preparation"] = _get_int(
            data, "temps_preparation", required=not partial, minimum=0, maximum=1440
        )
    if not partial or "temps_cuisson" in data:
        validated["temps_cuisson"] = _get_int(data, "temps_cuisson", required=not partial, minimum=0, maximum=1440)
    if "est_publique" in data:
        validated["est_publique"] = _get_bool(data, "est_publique")
    if "ingredients" in data:
        validated["ingredients"] = validate_recipe_ingredients(data["ingredients"])

    return {key: value for key, value in validated.items() if value is not None}


def validate_inventory_ingredients(items: Any) -> list[dict]:
    if not isinstance(items, list):
        raise ValidationError("Le champ ingredients doit etre une liste")

    validated_items = []
    for item in items:
        item_data = get_json_object(item)
        validated_items.append(
            {
                "id": _get_int(item_data, "id", minimum=1, maximum=10_000_000),
                "quantite_disponible": _get_float(
                    item_data, "quantite_disponible", minimum=0.0, maximum=100000.0
                ),
            }
        )

    return validated_items


def validate_inventory_payload(payload: Any, *, partial: bool = False) -> dict:
    data = get_json_object(payload)
    validated: dict[str, Any] = {}

    if not partial or "nom" in data:
        validated["nom"] = _get_string(data, "nom", required=not partial, min_len=2, max_len=120, pattern=SAFE_NAME_RE)
    if "ingredients" in data:
        validated["ingredients"] = validate_inventory_ingredients(data["ingredients"])

    return {key: value for key, value in validated.items() if value is not None}


def validate_inventory_quantity_payload(payload: Any) -> dict:
    data = get_json_object(payload)
    return {
        "quantite_disponible": _get_float(data, "quantite_disponible", minimum=0.0, maximum=100000.0),
    }


def validate_shopping_item_payload(payload: Any, *, partial: bool = False) -> dict:
    data = get_json_object(payload)
    validated: dict[str, Any] = {}

    if not partial or "ingredient_id" in data:
        validated["ingredient_id"] = _get_int(data, "ingredient_id", required=not partial, minimum=1, maximum=10_000_000)
    if not partial or "quantite" in data:
        validated["quantite"] = _get_float(data, "quantite", required=not partial, minimum=0.01, maximum=100000.0)
    if "est_achete" in data:
        validated["est_achete"] = _get_bool(data, "est_achete")

    return {key: value for key, value in validated.items() if value is not None}
