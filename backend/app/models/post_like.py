from sqlalchemy import Column, Integer, TIMESTAMP, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class PostLike(Base):
    __tablename__ = "community_likes"

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("post_id", "user_id"),
    )

    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="post_likes")
