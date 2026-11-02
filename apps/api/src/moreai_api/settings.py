from decimal import Decimal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    moreai_env: str = "development"
    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    supabase_secret_key: str | None = None
    supabase_jwt_secret: str | None = None
    database_url: str | None = None
    llm_provider_api_key: str | None = None
    credits_per_usd: Decimal | None = None
    llm_default_max_output_tokens: int = 2048


settings = Settings()
