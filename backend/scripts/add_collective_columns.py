
import os
import sys
from sqlalchemy import create_engine, Column, Boolean, Integer, MetaData, Table, text
from sqlalchemy_utils import database_exists, create_database
from contextlib import contextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add parent directory to path for database imports
# Assumes this script is run from the project root or backend directory
# Adjust sys.path as necessary for your execution environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import database configuration
from backend.database.config import config as db_config

def get_engine():
    """Dynamically get the SQLAlchemy engine based on db_config."""
    db_url = db_config.get_sqlalchemy_url()
    logger.info(f"Attempting to connect to database at: {db_url}")
    return create_engine(db_url)

def add_columns_to_transithistory():
    """
    Adds 'is_collective' and 'participant_count' columns to the TransitHistory table.
    """
    engine = get_engine()
    
    if not database_exists(engine.url):
        logger.error(f"Database {engine.url.database} does not exist.")
        sys.exit(1)

    metadata = MetaData()
    metadata.bind = engine

    # Reflect the existing TransitHistory table
    try:
        transit_history_table = Table('transit_history', metadata, autoload_with=engine)
        logger.info("TransitHistory table reflected successfully.")
    except Exception as e:
        logger.error(f"Error reflecting TransitHistory table: {e}")
        logger.error("Please ensure the table exists and connection details are correct.")
        sys.exit(1)

    with engine.connect() as connection:
        transaction = connection.begin()
        try:
            # Add is_collective column
            if 'is_collective' not in transit_history_table.columns:
                logger.info("Adding 'is_collective' column to transit_history...")
                connection.execute(text("ALTER TABLE transit_history ADD COLUMN is_collective BOOLEAN"))
                connection.execute(text("UPDATE transit_history SET is_collective = FALSE WHERE is_collective IS NULL"))
                connection.execute(text("ALTER TABLE transit_history ALTER COLUMN is_collective SET NOT NULL"))
                connection.execute(text("ALTER TABLE transit_history ALTER COLUMN is_collective SET DEFAULT FALSE"))
                logger.info("'is_collective' column added and defaults set.")
            else:
                logger.info("'is_collective' column already exists.")

            # Add participant_count column
            if 'participant_count' not in transit_history_table.columns:
                logger.info("Adding 'participant_count' column to transit_history...")
                connection.execute(text("ALTER TABLE transit_history ADD COLUMN participant_count INTEGER"))
                connection.execute(text("UPDATE transit_history SET participant_count = 1 WHERE participant_count IS NULL"))
                connection.execute(text("ALTER TABLE transit_history ALTER COLUMN participant_count SET NOT NULL"))
                connection.execute(text("ALTER TABLE transit_history ALTER COLUMN participant_count SET DEFAULT 1"))
                logger.info("'participant_count' column added and defaults set.")
            else:
                logger.info("'participant_count' column already exists.")
            
            transaction.commit()
            logger.info("Database schema updated successfully for TransitHistory.")

        except Exception as e:
            transaction.rollback()
            logger.error(f"Error during column addition: {e}")
            logger.error("Transaction rolled back.")
            sys.exit(1)

if __name__ == "__main__":
    add_columns_to_transithistory()
