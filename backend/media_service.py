"""
ConstructONS Storage Service.
Primary: Cloudinary Cloud Storage (with PDF extension preservation)
Fallback: Local Disk Storage
"""
import os
import uuid
import logging
from pathlib import Path
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

ALLOWED_MIME_PREFIXES = ("image/", "application/pdf")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

LOCAL_UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
LOCAL_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip()
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY", "").strip()
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "").strip()

USE_CLOUDINARY = bool(CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET)

if USE_CLOUDINARY:
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True
        )
        logger.info("[media] Production Cloudinary Storage Initialized")
    except Exception as e:
        logger.warning(f"[media] Cloudinary setup failed ({e}) — falling back to local disk storage")
        USE_CLOUDINARY = False


def init_storage() -> Optional[str]:
    return "cloudinary" if USE_CLOUDINARY else "local"


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Uploads file safely to Cloudinary or local disk, ensuring PDFs keep .pdf extensions."""
    if USE_CLOUDINARY:
        try:
            import cloudinary.uploader

            is_pdf = (content_type or "").lower() == "application/pdf" or path.lower().endswith(".pdf")
            
            # Extract folder and filename
            if "/" in path:
                folder = "/".join(path.split("/")[:-1])
                filename = path.split("/")[-1]
            else:
                folder = "constructons"
                filename = path

            if is_pdf:
                # Force .pdf extension in Cloudinary public_id so raw URLs end with .pdf
                if not filename.lower().endswith(".pdf"):
                    filename = f"{filename}.pdf"
                
                res = cloudinary.uploader.upload(
                    data,
                    folder=folder,
                    public_id=filename,
                    resource_type="raw",
                    overwrite=True
                )
            else:
                # For images, pass filename stem
                public_id_stem = filename.rsplit(".", 1)[0] if "." in filename else filename
                res = cloudinary.uploader.upload(
                    data,
                    folder=folder,
                    public_id=public_id_stem,
                    resource_type="image",
                    overwrite=True
                )

            return {
                "path": res.get("public_id") or path,
                "url": res.get("secure_url") or res.get("url"),
                "storage": "cloudinary"
            }
        except Exception as e:
            logger.error(f"[media] Cloudinary upload failed ({e}) — falling back to local disk")

    # Local Disk Fallback
    try:
        clean_path = path.lstrip("/")
        file_path = LOCAL_UPLOADS_DIR / clean_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(data)
        
        return {
            "path": clean_path,
            "url": f"/api/media/{clean_path}",
            "storage": "local"
        }
    except Exception as e:
        logger.error(f"[media] Local disk write failed: {e}")
        raise RuntimeError(f"Storage write error: {e}")


def get_object(path: str) -> Tuple[bytes, str]:
    """Retrieve file bytes from local disk."""
    clean = path.replace("\\", "/").lstrip("/")
    file_path = (LOCAL_UPLOADS_DIR / clean).resolve()
    
    if file_path.is_file():
        content = file_path.read_bytes()
        ext = file_path.suffix.lstrip(".").lower()
        if ext in ("jpg", "jpeg"):
            ct = "image/jpeg"
        elif ext == "png":
            ct = "image/png"
        elif ext == "webp":
            ct = "image/webp"
        elif ext == "pdf":
            ct = "application/pdf"
        else:
            ct = "application/octet-stream"
        return content, ct

    raise FileNotFoundError(f"File {path} not found on local disk")


def build_storage_path(category: str, filename: str, content_type: str) -> str:
    MIME_TO_EXT = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
        "application/pdf": "pdf",
    }
    ext = MIME_TO_EXT.get((content_type or "").lower())
    if not ext and filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
    if not ext:
        ext = "bin"
    safe_category = "".join(c for c in (category or "general") if c.isalnum() or c in "-_") or "general"
    return f"constructons/{safe_category}/{uuid.uuid4().hex}.{ext}"