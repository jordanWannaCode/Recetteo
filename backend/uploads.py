import os
from typing import Iterable

from werkzeug.utils import secure_filename

from backend.validation import ValidationError

try:
    import cloudinary
    import cloudinary.uploader
except ImportError:  # Cloudinary est optionnel (dev local)
    cloudinary = None


def _detect_image_type(header: bytes) -> str | None:
    if len(header) >= 3 and header[:3] == b"\xFF\xD8\xFF":
        return "jpg"
    if len(header) >= 8 and header[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "webp"
    return None


def validate_image_upload(file_storage, allowed_exts: Iterable[str]) -> str:
    if not file_storage or not file_storage.filename:
        raise ValidationError("Aucun fichier fourni")

    safe_name = secure_filename(file_storage.filename)
    if not safe_name or "." not in safe_name:
        raise ValidationError("Format de fichier non supporte")

    ext = os.path.splitext(safe_name)[1].lstrip(".").lower()
    allowed = {ext.lower() for ext in allowed_exts}

    if ext not in allowed:
        raise ValidationError("Format de fichier non supporte")

    header = file_storage.stream.read(64)
    file_storage.stream.seek(0)

    detected = _detect_image_type(header)
    allowed_norm = {"jpg" if item == "jpeg" else item for item in allowed}

    if detected not in allowed_norm:
        raise ValidationError("Fichier image invalide")

    return ext


def upload_to_cloudinary(file_storage, folder: str) -> str | None:
    cloudinary_url = os.environ.get("CLOUDINARY_URL")
    if not cloudinary_url:
        return None
    if cloudinary is None:
        raise ValidationError("Cloudinary non disponible")

    cloudinary.config(cloudinary_url=cloudinary_url)
    result = cloudinary.uploader.upload(
        file_storage,
        folder=folder,
        resource_type="image",
    )
    return result.get("secure_url")
