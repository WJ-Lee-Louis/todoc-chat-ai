import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.api.deps import get_current_user
from app.models import User
from app.core.config import settings

router = APIRouter(prefix="/files", tags=["files"])

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = "general",
    current_user: User = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Generate unique filename
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{ext}"

    # Create upload directory if not exists
    upload_path = os.path.join(settings.UPLOAD_DIR, folder)
    os.makedirs(upload_path, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_path, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Return relative path for storage in DB
    relative_path = f"{folder}/{unique_filename}"

    return {
        "file_path": relative_path,
        "url": f"/static/uploads/{relative_path}"
    }
