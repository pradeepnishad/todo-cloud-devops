from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import User, Task

from schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TaskCreate,
    TaskUpdate,
    TaskResponse
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)


app = FastAPI(
    title="Todo App API",
    description="Local Todo Application API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {
        "message": "Todo App API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/database-test")
def database_test(db: Session = Depends(get_db)):
    user_count = db.query(User).count()

    return {
        "database": "connected",
        "users": user_count
    }


@app.post(
    "/auth/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Create new user
    new_user = User(
        email=user.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post(
    "/auth/login",
    response_model=Token
)

def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    # Find user
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    password_valid = verify_password(
        user.password,
        existing_user.password_hash
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT
    access_token = create_access_token(
        existing_user.id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get(
    "/auth/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
    


@app.post(
    "/tasks",
    response_model=TaskResponse
)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_task = Task(
        user_id=current_user.id,
        title=task.title,
        description=task.description,
        status="pending"
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

@app.get(
    "/tasks",
    response_model=list[TaskResponse]
)
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id
        )
        .order_by(
            Task.created_at.desc()
        )
        .all()
    )

    return tasks


@app.get(
    "/tasks/history",
    response_model=list[TaskResponse]
)
def task_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == "completed"
        )
        .order_by(Task.completed_at.desc())
        .all()
    )

    return tasks

@app.get("/tasks/stats")
def task_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .count()
    )

    pending = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == "pending"
        )
        .count()
    )

    completed = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == "completed"
        )
        .count()
    )

    return {
        "total": total,
        "pending": pending,
        "completed": completed
    }



@app.get(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task

@app.put(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    db.commit()
    db.refresh(task)

    return task

@app.patch(
    "/tasks/{task_id}/done",
    response_model=TaskResponse
)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.status = "completed"
    task.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return task

@app.delete(
    "/tasks/{task_id}"
)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }

