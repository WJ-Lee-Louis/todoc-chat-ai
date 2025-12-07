from sqlalchemy import Column, Integer, Numeric, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import SymptomEnum


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), primary_key=True)
    temperature = Column(Numeric(4, 1))
    symptom = Column(Enum(SymptomEnum), nullable=False)
    symptom_other = Column(Text)

    record = relationship("Record", back_populates="health_record")
