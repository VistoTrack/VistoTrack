from fastapi import FastAPI
from app.database import engine, Base
from app.routes import auth

# Criar instância do FastAPI
app = FastAPI(title="VistoTrack API", version="1.0")

# Incluir as rotas
app.include_router(auth.router)

# Criar tabelas ao iniciar a aplicação (para desenvolvimento)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Rota de teste
@app.get("/ping")
async def ping():
    return {"message": "API VistoTrack está online!"}
