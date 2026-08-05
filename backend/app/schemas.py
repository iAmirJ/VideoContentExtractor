from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str
    password: str
    username: str = "User"

class UserResponse(BaseModel):
    user_id: int
    email: str
    username: str

class ExportRequest(BaseModel):
    title: str
    content: str

class ProfileUpdate(BaseModel):
    full_name: str
    email: str
    role: str