from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.future import select
from sqlalchemy import Column, Integer, String
from dotenv import load_dotenv
import os
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configuração do banco de dados PostgreSQL via .env (usando asyncpg)
DATABASE_URL = os.getenv('DATABASE_URL')

DEBUG_MODE = os.getenv("DEBUG", "false").lower() == "true"

engine = create_async_engine(DATABASE_URL, echo=DEBUG_MODE, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Criar contexto de senha seguro
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Modelo SQLAlchemy
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telefone = Column(String, nullable=False)
    senha = Column(String, nullable=False)

# Modelo Pydantic para entrada de dados
class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    telefone: str
    senha: str

# Criar instância do FastAPI
app = FastAPI(title="VistoTrack API", version="1.0")

# Criar sessão de banco de dados corretamente
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Rota para verificar se a API está online
@app.get("/ping")
async def ping():
    return {"message": "API VistoTrack está online!"}

# Rota para registrar um novo usuário
@app.post("/auth/register")
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Verificar se o usuário já existe
    stmt = select(User).where(User.email == user.email)
    existing_user = await db.execute(stmt)
    if existing_user.scalar():
        raise HTTPException(status_code=400, detail="Usuário já cadastrado")
    
    # Criar usuário no banco de dados
    hashed_password = hash_password(user.senha)
    new_user = User(nome=user.nome, email=user.email, telefone=user.telefone, senha=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "Usuário registrado com sucesso", "user": {"nome": user.nome, "email": user.email, "telefone": user.telefone}}
