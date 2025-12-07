from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import SleepQualityEnum


class SleepRecord(Base):
    __tablename__ = "sleep_records"

    id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), primary_key=True)
    start_datetime = Column(TIMESTAMP, nullable=False)
    end_datetime = Column(TIMESTAMP, nullable=False)
    sleep_quality = Column(Enum(SleepQualityEnum), nullable=False)

    record = relationship("Record", back_populates="sleep_record")
