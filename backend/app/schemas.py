from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OfficerRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    officer_id: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    designation: str = Field(min_length=2, max_length=100)
    checkpost_id: int = Field(gt=0)


class OfficerLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class CheckpostInfo(BaseModel):
    id: int
    name: str
    address: str

    model_config = ConfigDict(from_attributes=True)


class OfficerProfile(BaseModel):
    id: int
    officer_id: str
    full_name: str
    email: EmailStr
    designation: str
    account_status: str
    checkpost: CheckpostInfo | None = None
    is_admin: bool = False