from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str



class TaskCreate(BaseModel):
    title: str
    description: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    status: str
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True