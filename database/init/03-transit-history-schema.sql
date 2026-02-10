CREATE TABLE IF NOT EXISTS transit_history (
    id SERIAL PRIMARY KEY,
    recipe_id VARCHAR(255) NOT NULL,
    dominant_transit VARCHAR(255),
    ritual_instruction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
