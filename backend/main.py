import os
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime,
    ForeignKey, Table, JSON, func
)
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session, relationship
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-use-a-long-random-string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todolist.db")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ── ORM Models ────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="owner", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="owner", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    color = Column(String(20), default="#6366f1")
    icon = Column(String(10), default="📁")
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="categories")
    tasks = relationship("Task", back_populates="category")


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    color = Column(String(20), default="#6366f1")
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="tags")
    tasks = relationship("Task", secondary=task_tags, back_populates="tags")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    status = Column(String(20), default="todo")      # todo | in_progress | done
    priority = Column(String(10), default="medium")   # low | medium | high
    due_date = Column(DateTime, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    assignees = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")


# ── Pydantic Schemas ──────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class CategoryCreate(BaseModel):
    name: str
    color: str = "#6366f1"
    icon: str = "📁"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    color: str
    icon: str
    user_id: int

    model_config = {"from_attributes": True}


class TagCreate(BaseModel):
    name: str
    color: str = "#6366f1"


class TagResponse(BaseModel):
    id: int
    name: str
    color: str

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
    assignees: List[str] = []
    tag_ids: List[int] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
    assignees: Optional[List[str]] = None
    tag_ids: Optional[List[int]] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str
    due_date: Optional[datetime]
    category_id: Optional[int]
    category: Optional[CategoryResponse]
    user_id: int
    assignees: List[str]
    tags: List[TagResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Auth Helpers ──────────────────────────────────────────────────────────────
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise exc
    except JWTError:
        raise exc
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise exc
    return user


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="TodoList API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# ── Auth Routes ───────────────────────────────────────────────────────────────
@app.post("/auth/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    for name, color, icon in [
        ("Work", "#3b82f6", "💼"),
        ("Personal", "#10b981", "🏠"),
        ("Shopping", "#f59e0b", "🛒"),
        ("Health", "#ef4444", "❤️"),
    ]:
        db.add(Category(name=name, color=color, icon=icon, user_id=user.id))
    db.commit()

    token = create_access_token({"sub": user.username}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    token = create_access_token({"sub": user.username}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Category Routes ───────────────────────────────────────────────────────────
@app.get("/categories", response_model=List[CategoryResponse])
def list_categories(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.user_id == user.id).all()


@app.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(payload: CategoryCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = Category(**payload.model_dump(), user_id=user.id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@app.put("/categories/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: int, payload: CategoryUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id, Category.user_id == user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@app.delete("/categories/{cat_id}")
def delete_category(cat_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id, Category.user_id == user.id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Deleted"}


# ── Tag Routes ────────────────────────────────────────────────────────────────
@app.get("/tags", response_model=List[TagResponse])
def list_tags(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Tag).filter(Tag.user_id == user.id).all()


@app.post("/tags", response_model=TagResponse, status_code=201)
def create_tag(payload: TagCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tag = Tag(**payload.model_dump(), user_id=user.id)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@app.delete("/tags/{tag_id}")
def delete_tag(tag_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"message": "Deleted"}


# ── Task Routes ───────────────────────────────────────────────────────────────
@app.get("/tasks", response_model=List[TaskResponse])
def list_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    tag_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    due_before: Optional[datetime] = Query(None),
    due_after: Optional[datetime] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Task).filter(Task.user_id == user.id)
    if status:
        q = q.filter(Task.status == status)
    if priority:
        q = q.filter(Task.priority == priority)
    if category_id:
        q = q.filter(Task.category_id == category_id)
    if tag_id:
        q = q.filter(Task.tags.any(Tag.id == tag_id))
    if search:
        pattern = f"%{search}%"
        q = q.filter((Task.title.ilike(pattern)) | (Task.description.ilike(pattern)))
    if due_before:
        q = q.filter(Task.due_date <= due_before)
    if due_after:
        q = q.filter(Task.due_date >= due_after)
    return q.order_by(Task.created_at.desc()).all()


@app.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(payload: TaskCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tag_ids = payload.tag_ids
    data = payload.model_dump(exclude={"tag_ids"})
    task = Task(**data, user_id=user.id)
    if tag_ids:
        task.tags = db.query(Tag).filter(Tag.id.in_(tag_ids), Tag.user_id == user.id).all()
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude_unset=True)
    tag_ids = data.pop("tag_ids", None)

    for k, v in data.items():
        setattr(task, k, v)

    if tag_ids is not None:
        task.tags = db.query(Tag).filter(Tag.id.in_(tag_ids), Tag.user_id == user.id).all()

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Deleted"}


# ── Dashboard Stats ───────────────────────────────────────────────────────────
@app.get("/dashboard/stats")
def dashboard_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    base = db.query(Task).filter(Task.user_id == user.id)
    total = base.count()
    todo = base.filter(Task.status == "todo").count()
    in_progress = base.filter(Task.status == "in_progress").count()
    done = base.filter(Task.status == "done").count()

    now = datetime.utcnow()
    overdue = (
        db.query(Task)
        .filter(Task.user_id == user.id, Task.due_date < now, Task.status != "done")
        .count()
    )
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    due_today = (
        db.query(Task)
        .filter(
            Task.user_id == user.id,
            Task.due_date >= today_start,
            Task.due_date <= today_end,
            Task.status != "done",
        )
        .count()
    )

    categories = db.query(Category).filter(Category.user_id == user.id).all()
    by_category = [
        {
            "name": c.name,
            "color": c.color,
            "icon": c.icon,
            "count": db.query(Task).filter(Task.user_id == user.id, Task.category_id == c.id).count(),
        }
        for c in categories
    ]

    by_priority = {
        "low": base.filter(Task.priority == "low").count(),
        "medium": base.filter(Task.priority == "medium").count(),
        "high": base.filter(Task.priority == "high").count(),
    }

    recent = base.order_by(Task.created_at.desc()).limit(5).all()

    return {
        "total": total,
        "todo": todo,
        "in_progress": in_progress,
        "done": done,
        "overdue": overdue,
        "due_today": due_today,
        "completion_rate": round((done / total * 100) if total > 0 else 0, 1),
        "by_category": by_category,
        "by_priority": by_priority,
        "recent_tasks": [TaskResponse.model_validate(t) for t in recent],
    }
