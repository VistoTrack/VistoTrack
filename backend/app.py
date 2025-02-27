from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String
from dotenv import load_dotenv
import os
import random
import string
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Criar a instância do FastAPI
app = FastAPI(title="VistoTrack API", version="1.0")

# Configuração do banco de dados PostgreSQL via .env (usando asyncpg)
DATABASE_URL = os.getenv('DATABASE_URL')

engine = create_async_engine(DATABASE_URL, echo=True, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Criação do contexto para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_salt(length: int) -> str:
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def hash_password(encrypted_password: str) -> tuple[str, int]:
    salt_length = 255 - len(encrypted_password)
    salt = generate_salt(salt_length)
    final_hashed_password = pwd_context.hash(encrypted_password + salt)
    return final_hashed_password, salt_length

# Modelo SQLAlchemy para usuários
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telefone = Column(String, nullable=False)
    senha = Column(String, nullable=False)
    salt_length = Column(Integer, nullable=False)

# Criar tabelas no banco de dados
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Modelo Pydantic para entrada de dados
class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    telefone: str
    senha: str  # Senha já criptografada no frontend

# Rota para verificar se a API está online
@app.get("/ping")
async def ping():
    return {"message": "API VistoTrack está online!"}

# Rota para registrar um novo usuário
@app.post("/auth/register")
async def register_user(user: UserCreate, db: AsyncSession = Depends(AsyncSessionLocal)):
    # Verificar se o usuário já existe
    existing_user = await db.execute("SELECT * FROM users WHERE email = :email", {"email": user.email})
    if existing_user.fetchone():
        raise HTTPException(status_code=400, detail="Usuário já cadastrado")
    
    # Criar usuário no banco de dados com senha já criptografada do frontend e aplicar segunda criptografia no backend
    hashed_password, salt_length = hash_password(user.senha)
    new_user = User(nome=user.nome, email=user.email, telefone=user.telefone, senha=hashed_password, salt_length=salt_length)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "Usuário registrado com sucesso", "user": {"nome": user.nome, "email": user.email, "telefone": user.telefone}} 

# Inicializar o banco de dados na inicialização da aplicação
@app.on_event("startup")
async def startup():
    await init_db()
