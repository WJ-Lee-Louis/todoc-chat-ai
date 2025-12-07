from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.enums import SenderTypeEnum


class ChatSessionCreate(BaseModel):
    kid_id: int


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    ai_mode_id: Optional[int] = None


class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    sender: SenderTypeEnum
    ai_mode_id: Optional[int]
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: int
    kid_id: int
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[ChatMessageResponse]] = None

    class Config:
        from_attributes = True
