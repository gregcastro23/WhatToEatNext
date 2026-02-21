import psycopg2
import os

# Connection details - adjusted for Docker internal network/default if needed,
# but User prompt specified: 192.168.0.129:5434
# Since I am running on the "Mac Mini" (the user's machine), I should try to connect to localhost or the exposed port.
# The user prompt specifically gave a python one-liner. I will create a robust script file.

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5434")
DB_NAME = os.getenv("DB_NAME", "alchm_kitchen")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres") # Default? User didn't specify password in the prompt, assuming standard dev defaults or relying on trust.

def run_migration():
    try:
        print(f"Connecting to database {DB_NAME} at {DB_HOST}:{DB_PORT} as {DB_USER}...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cur = conn.cursor()

        print("Executing migration...")
        # Add is_collective column
        print("Adding is_collective column...")
        cur.execute("ALTER TABLE transit_history ADD COLUMN IF NOT EXISTS is_collective BOOLEAN DEFAULT FALSE;")

        # Add participant_count column
        print("Adding participant_count column...")
        cur.execute("ALTER TABLE transit_history ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 1;")

        conn.commit()
        print("Phase 7 Migration Successful: Collective columns added.")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Migration Failed: {e}")

if __name__ == "__main__":
    run_migration()
