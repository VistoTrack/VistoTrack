from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import User
from app.schemas import UserCreate
from app.utils.security import hash_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
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
    
    return {"message": "Usuário registrado com sucesso"}
