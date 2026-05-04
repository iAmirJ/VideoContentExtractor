from sqlalchemy import create_engine, text

# Aapka direct PostgreSQL URL (Bina kisi file ko import kiye)
DB_URL = "postgresql+psycopg2://vidio:secret@localhost:5432/vidiomind"

# Engine direct yahan bana liya
engine = create_engine(DB_URL)

def update_postgres_db():
    try:
        with engine.connect() as conn:
            
            # 1. full_name column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100);"))
                conn.commit()  # Sath hi save kar diya
                print("✅ 'full_name' column successfully added!")
            except Exception as e:
                print("⚠️ full_name column shayad pehle se mojood hai.")

            # 2. role column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(100);"))
                conn.commit()  # Sath hi save kar diya
                print("✅ 'role' column successfully added!")
            except Exception as e:
                print("⚠️ role column shayad pehle se mojood hai.")

            print("🎉 PostgreSQL Database update complete! Purana data bilkul safe hai.")

    except Exception as e:
        print("Database connection mein masla hai:", e)

if __name__ == "__main__":
    update_postgres_db()