from sqlalchemy import Column, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import StoolAmountEnum, StoolConditionEnum, StoolColorEnum


class StoolRecord(Base):
    __tablename__ = "stool_records"

    id = Column(Integer, ForeignKey("records.id", ondelete="CASCADE"), primary_key=True)
    amount = Column(Enum(StoolAmountEnum), nullable=False)
    condition = Column(Enum(StoolConditionEnum), nullable=False)
    color = Column(Enum(StoolColorEnum), nullable=False)

    record = relationship("Record", back_populates="stool_record")
