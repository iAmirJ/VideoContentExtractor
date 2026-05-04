import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .env file load karein
load_dotenv()

# Sirf environment variable se URL uthayen
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

# Agar URL nahi mil raha toh error throw karein (Security check)
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file. PostgreSQL is required!")

# PostgreSQL connection engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()