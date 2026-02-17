from pydantic import BaseModel, Field, field_validator, ConfigDict, EmailStr
from typing import Optional, Literal

# --- AUTH SCHEMAS ---

class UserRegisterSchema(BaseModel):
    """
    Validation for new user registration.
    Ensures emails are valid and passwords meet a minimum safety bar.
    """
    email: EmailStr  # Requires 'email-validator' package
    password: str = Field(..., min_length=8, max_length=100)
    role: Literal['manager', 'developer'] = 'developer'

    model_config = ConfigDict(str_strip_whitespace=True)

class UserLoginSchema(BaseModel):
    """
    Validation for user login attempts.
    """
    email: EmailStr
    password: str = Field(..., min_length=1)

    model_config = ConfigDict(str_strip_whitespace=True)


# --- FEATURE FLAG SCHEMAS ---

class FlagCreateSchema(BaseModel):
    """
    Validation for creating a new feature flag.
    Fulfills: 'Interface Safety' and 'Correctness'.
    """
    name: str = Field(..., min_length=3, max_length=50)
    
    # Enforces snake_case via regex (e.g., 'new_checkout_flow')
    key: str = Field(..., pattern=r"^[a-z0-9_]+$") 
    
    description: Optional[str] = Field(None, max_length=200)

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator('key')
    @classmethod
    def key_must_be_snake_case(cls, v: str) -> str:
        """Sanitizes the key to be lowercase and space-free."""
        if " " in v:
            raise ValueError("Key must not contain spaces")
        return v.lower()

class FlagToggleSchema(BaseModel):
    """
    Validation for toggling a flag's status.
    Fulfills: 'Observability' and 'Safety Culture'.
    """
    environment_id: int
    
    # Requiring a reason is a "Senior" move—it forces developers to document intent.
    reason: str = Field(..., min_length=5)

    model_config = ConfigDict(str_strip_whitespace=True)


# --- AI RISK SCHEMAS ---

class RiskAnalysisSchema(BaseModel):
    """
    Validation for the AI Risk Analysis context.
    Fulfills: 'AI Integration'.
    """
    feature_name: str
    environment: str
    description: str

    model_config = ConfigDict(str_strip_whitespace=True)