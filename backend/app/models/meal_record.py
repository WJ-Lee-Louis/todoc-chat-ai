from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import MealTypeEnum


class MealRecord(Base):
    __tablename__ = "meal_records"

    id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), primary_key=True)
    meal_type = Column(Enum(MealTypeEnum), nullable=False)
    meal_detail = Column(Text)
    burp = Column(Boolean)

    record = relationship("Record", back_populates="meal_record")
