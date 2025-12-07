from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import RecordTypeEnum


class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True)
    kid_id = Column(Integer, ForeignKey("kids.id", ondelete="CASCADE"), nullable=False)
    record_type = Column(Enum(RecordTypeEnum), nullable=False)
    title = Column(String(200))
    memo = Column(Text)
    image_url = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    kid = relationship("Kid", back_populates="records")
    
    # Relationships to specific record types
    meal_record = relationship("MealRecord", back_populates="record", uselist=False, cascade="all, delete-orphan")
    sleep_record = relationship("SleepRecord", back_populates="record", uselist=False, cascade="all, delete-orphan")
    health_record = relationship("HealthRecord", back_populates="record", uselist=False, cascade="all, delete-orphan")
    growth_record = relationship("GrowthRecord", back_populates="record", uselist=False, cascade="all, delete-orphan")
    stool_record = relationship("StoolRecord", back_populates="record", uselist=False, cascade="all, delete-orphan")
