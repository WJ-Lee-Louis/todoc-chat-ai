from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.api.deps import get_db, get_current_user
from app.models import User, Kid, Record, RecordTypeEnum, MealRecord, SleepRecord, HealthRecord, GrowthRecord
from app.schemas.kid import KidCreate, KidUpdate, KidResponse

router = APIRouter(prefix="/kids", tags=["kids"])


@router.get("/", response_model=List[KidResponse])
def get_kids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kids = db.query(Kid).filter(Kid.user_id == current_user.id).all()
    return kids


@router.post("/", response_model=KidResponse, status_code=status.HTTP_201_CREATED)
def create_kid(
    kid_data: KidCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_kid = Kid(
        user_id=current_user.id,
        name=kid_data.name,
        birth_date=kid_data.birth_date,
        gender=kid_data.gender
    )
    db.add(new_kid)
    db.commit()
    db.refresh(new_kid)
    return new_kid


@router.get("/{kid_id}", response_model=KidResponse)
def get_kid(
    kid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )
    return kid


@router.put("/{kid_id}", response_model=KidResponse)
def update_kid(
    kid_id: int,
    kid_data: KidUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )

    update_data = kid_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(kid, field, value)

    db.commit()
    db.refresh(kid)
    return kid


@router.delete("/{kid_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kid(
    kid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )

    db.delete(kid)
    db.commit()
    return None


@router.get("/{kid_id}/dashboard")
def get_kid_dashboard(
    kid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )

    # Get recent records by joining through Record base table
    recent_meal = db.query(MealRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(MealRecord.record)).order_by(Record.created_at.desc()).first()

    recent_sleep = db.query(SleepRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(SleepRecord.record)).order_by(Record.created_at.desc()).first()

    recent_health = db.query(HealthRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(HealthRecord.record)).order_by(Record.created_at.desc()).first()

    recent_growth = db.query(GrowthRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(GrowthRecord.record)).order_by(Record.created_at.desc()).first()

    return {
        "kid": KidResponse.model_validate(kid),
        "recent_records": {
            "meal": recent_meal,
            "sleep": recent_sleep,
            "health": recent_health,
            "growth": recent_growth
        }
    }
