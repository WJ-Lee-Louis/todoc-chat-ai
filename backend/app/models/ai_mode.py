from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class AIMode(Base):
    __tablename__ = "ai_modes"

    id = Column(Integer, primary_key=True)
    name = Column(String(20), unique=True, nullable=False)
    description = Column(Text)

    chat_messages = relationship("ChatMessage", back_populates="ai_mode")
