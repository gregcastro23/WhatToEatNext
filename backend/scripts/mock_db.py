
from unittest.mock import MagicMock

def get_db_engine():
    """
    Mock database engine that simulates the existence of the 'transit_history' table.
    """
    engine = MagicMock()
    inspector = MagicMock()
    inspector.has_table.return_value = True
    engine.connect.return_value.__enter__.return_value.execute.return_value.fetchone.return_value = (1,)
    
    # We need to mock the `inspect` function from sqlalchemy
    # This is a bit tricky, but we can patch it in the verification script
    
    return engine
