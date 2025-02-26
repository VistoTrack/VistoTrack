from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Criar a instância do FastAPI
app = FastAPI(title="VistoTrack API", version="1.0")

# Configuração do banco de dados PostgreSQL via .env (usando asyncpg)
DATABASE_URL = os.getenv('DATABASE_URL')

engine = create_async_engine(DATABASE_URL, echo=True, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Rota para verificar se a API está online
@app.get("/ping")
async def ping():
    return {"message": "API VistoTrack está online!"}
