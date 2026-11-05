from moreai_api.settings import Settings

def test_settings_defaults_are_non_secret():
    settings = Settings(_env_file=None)
    assert settings.moreai_env == "development"
    assert settings.supabase_secret_key is None
