from pydantic import BaseModel

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