from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    애플리케이션 설정을 관리하며, .env 파일이나 환경 변수에서 값을 읽어옵니다.
    """
    # 1. DB 설정 (MySQL)
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # 2. OpenAI API Key
    GMS_API_KEY: str
    GMS_MODEL: str
    GMS_BASE_URL: str

    # server
    SERVER_HOST: str
    SERVER_PORT: int

    class Config:
        # .env 파일을 읽어들입니다.
        env_file = ".env"

# 이 settings 객체를 다른 파일에서 import하여 사용합니다.
settings = Settings()