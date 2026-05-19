import os
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))


def _required_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"La variable d'environnement {name} est obligatoire")
    return value


def _parse_cors_origins():
    raw = os.environ.get('CORS_ORIGINS', '')
    origins = [origin.strip() for origin in raw.split(',') if origin.strip()]
    if not origins:
        origins = ['http://localhost:5173', 'http://localhost:3000']
    if os.environ.get('FLASK_ENV', '').lower() == 'development':
        for dev_origin in ('http://localhost:5173', 'http://localhost:3000'):
            if dev_origin not in origins:
                origins.append(dev_origin)
    return origins


class Config:
    SECRET_KEY = _required_env('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = _required_env('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = _required_env('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_DECODE_LEEWAY = 5
    MAX_CONTENT_LENGTH = 1024 * 1024
    CORS_ORIGINS = _parse_cors_origins()
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'instance', 'uploads'))
    ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
