from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Carregar variáveis de ambiente do .env
load_dotenv()

# Configuração do banco de dados PostgreSQL via .env
DATABASE_URL = os.getenv('DATABASE_URL')

# Criando a conexão assíncrona com o banco
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Criando a base do ORM
Base = declarative_base()

# Dependência do banco para FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
