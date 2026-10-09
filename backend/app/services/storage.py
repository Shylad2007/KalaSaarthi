from supabase import create_client, Client
import os
import uuid

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
BUCKET_NAME  = os.getenv("SUPABASE_BUCKET", "product-images")

_supabase: Client | None = None

def _get_client() -> Client | None:
    global _supabase
    if _supabase is not None:
        return _supabase
    if SUPABASE_URL and SUPABASE_KEY:
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class StorageService:

    @staticmethod
    def upload_image(user_id: int, product_id: int, file_bytes: bytes, mime_type: str, filename: str) -> str:
        """
        Upload image bytes to Supabase Storage.
        Returns the public URL of the uploaded image.
        Raises ValueError for invalid inputs, RuntimeError for upload failures.
        """
        # --- Validate ---
        if mime_type not in ALLOWED_TYPES:
            raise ValueError(f"Unsupported image type '{mime_type}'. Allowed: JPEG, PNG, WebP, GIF.")
        if len(file_bytes) > MAX_SIZE_BYTES:
            raise ValueError(f"File too large ({len(file_bytes)//1024} KB). Maximum allowed size is 10 MB.")
        if len(file_bytes) == 0:
            raise ValueError("Empty file received.")

        client = _get_client()
        if not client:
            raise RuntimeError(
                "Supabase storage is not configured. "
                "Set SUPABASE_URL, SUPABASE_KEY, and SUPABASE_BUCKET in backend/.env."
            )

        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
        file_path = f"{user_id}/{product_id}/{uuid.uuid4()}.{ext}"

        try:
            client.storage.from_(BUCKET_NAME).upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": mime_type, "upsert": "true"},
            )
        except Exception as e:
            raise RuntimeError(f"Upload to Supabase failed: {e}")

        try:
            public_url = client.storage.from_(BUCKET_NAME).get_public_url(file_path)
        except Exception as e:
            raise RuntimeError(f"Could not retrieve public URL after upload: {e}")

        return public_url

    @staticmethod
    def delete_image(file_path: str) -> None:
        """Delete a file from Supabase Storage by its path segment (not the full URL)."""
        client = _get_client()
        if not client:
            return
        try:
            client.storage.from_(BUCKET_NAME).remove([file_path])
        except Exception:
            pass  # Non-critical: stale orphan, log and move on
