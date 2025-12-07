from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class GrowthRecord(Base):
    __tablename__ = "growth_records"

    id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), primary_key=True)
    height_cm = Column(Numeric(5, 2))
    weight_kg = Column(Numeric(5, 2))

    record = relationship("Record", back_populates="growth_record")
