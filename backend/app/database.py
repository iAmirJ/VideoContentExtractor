from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CHANGE: Using SQLite instead of MySQL ---
# Yeh file aapke folder mein khud ban jaye gi
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# connect_args={"check_same_thread": False} sirf SQLite ke liye zaroori hota hai
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# # XAMPP default: user='root', password='', host='localhost', db='fyp_db'
# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost/fyp_db"

# engine = create_engine(SQLALCHEMY_DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()