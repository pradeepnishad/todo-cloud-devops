from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="pending",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )