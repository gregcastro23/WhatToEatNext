import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import List, Dict, Any
import os
import sys

# Ensure backend modules are importable
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Assuming these imports are resolvable in the Mac Mini's Python environment.
# Note: Adjust paths if necessary based on actual structure
try:
    from backend.database.connection import get_db_session
    from backend.database.models import TransitHistory
    from backend.database.config import config as db_config # Database config
    # from backend.config.celestial_config import FOREST_HILLS_COORDINATES # Corrected import for coordinates
    # Replacing with hardcoded coordinates if import fails or as a fallback
    FOREST_HILLS_COORDINATES = {
        "latitude": 40.7181,
        "longitude": -73.8448,
        "timezone": "America/New_York"
    }
    from backend.utils.transmutation_oracle import TransmutationOracle # Our new oracle
except ImportError as e:
    print(f"Error importing backend modules: {e}")
    sys.exit(1)

# --- Imbalance Thresholds (adjustable) ---
MATTER_STAGNATION_MATTER_HIGH_THRESHOLD = 0.6
MATTER_STAGNATION_SPIRIT_LOW_THRESHOLD = 0.4
SPIRIT_VOLATILITY_SPIRIT_HIGH_THRESHOLD = 0.6
SPIRIT_VOLATILITY_MATTER_LOW_THRESHOLD = 0.4

def run_predictive_intelligence_audit(days: int = 7):
    """
    Performs elemental imbalance analysis and generates transmutation recommendations.
    """
    end_date = datetime.datetime.now(datetime.timezone.utc)
    start_date = end_date - datetime.timedelta(days=days)

    imbalance_type = None

    try:
        # Use get_db_session() context manager
        # Assuming get_db_session yields a session
        session_generator = get_db_session()
        session = next(session_generator) if hasattr(session_generator, '__next__') else session_generator

        # If get_db_session is a context manager, use 'with'
        # Adjusting based on common patterns, but error handling needed
        # Let's try to use it as a context manager if possible, or just use the session

        # Re-reading prompt: "with get_db_session() as session:"
        # So it is a context manager.
        pass
    except Exception as e:
        print(f"Database connection setup failed: {e}")
        return

    try:
        with get_db_session() as session:
            stmt = select(
                func.avg(TransitHistory.matter_score),
                func.avg(TransitHistory.spirit_score)
            ).where(
                TransitHistory.created_at >= start_date,
                TransitHistory.created_at <= end_date
            )

            result = session.execute(stmt).first()

            print(f"--- Elemental Imbalance Analysis (Last {days} Days) ---")
            print(f"Period: {start_date.isoformat()} to {end_date.isoformat()}")

            if result and result[0] is not None and result[1] is not None:
                matter_score_avg = float(result[0])
                spirit_score_avg = float(result[1])

                print(f"Average Matter Score: {matter_score_avg:.2f}")
                print(f"Average Spirit Score: {spirit_score_avg:.2f}")

                imbalance_detected = False

                if matter_score_avg > MATTER_STAGNATION_MATTER_HIGH_THRESHOLD and \
                   spirit_score_avg < MATTER_STAGNATION_SPIRIT_LOW_THRESHOLD:
                    print("Status: Matter Stagnation Detected!")
                    print(f" (High Matter: {matter_score_avg:.2f} > {MATTER_STAGNATION_MATTER_HIGH_THRESHOLD}, "
                          f"Low Spirit: {spirit_score_avg:.2f} < {MATTER_STAGNATION_SPIRIT_LOW_THRESHOLD})")
                    imbalance_type = "Matter Stagnation"
                    imbalance_detected = True

                elif spirit_score_avg > SPIRIT_VOLATILITY_SPIRIT_HIGH_THRESHOLD and \
                     matter_score_avg < SPIRIT_VOLATILITY_MATTER_LOW_THRESHOLD:
                    print("Status: Spirit Volatility Detected!")
                    print(f" (High Spirit: {spirit_score_avg:.2f} > {SPIRIT_VOLATILITY_SPIRIT_HIGH_THRESHOLD}, "
                          f"Low Matter: {matter_score_avg:.2f} < {SPIRIT_VOLATILITY_MATTER_LOW_THRESHOLD})")
                    imbalance_type = "Spirit Volatility"
                    imbalance_detected = True

                if not imbalance_detected:
                    print("Status: Elemental Balance within nominal range.")
                    print(f" (Matter Avg: {matter_score_avg:.2f}, Spirit Avg: {spirit_score_avg:.2f})")

            else:
                print(f"No transit history data found for the last {days} days.")

    except Exception as e:
        print(f"An error occurred during imbalance analysis: {e}")
        return # Exit if imbalance analysis fails

    print("\n--- Transmutation Recommendations ---")
    if imbalance_type:
        try:
            oracle = TransmutationOracle(
                latitude=FOREST_HILLS_COORDINATES["latitude"],
                longitude=FOREST_HILLS_COORDINATES["longitude"],
                timezone_str=FOREST_HILLS_COORDINATES["timezone"]
            )
            recommendations = oracle.get_transmutation_recommendation(imbalance_type)

            if recommendations and isinstance(recommendations, list) and len(recommendations) > 0:
                 if "error" not in recommendations[0]:
                    for rec in recommendations:
                        print(f"- {rec.get('recommendation_text', 'No text')} (Potency Multiplier: {rec.get('total_potency_score_multiplier', 'N/A')})")
                 elif "error" in recommendations[0]:
                    print(f"Error generating recommendations: {recommendations[0]['error']}")
            else:
                print("No specific transmutation recommendations found for the next 3 days.")
        except Exception as e:
             print(f"Error initializing TransmutationOracle: {e}")

    else:
        print("No significant elemental imbalance detected, no specific recommendations needed.")


if __name__ == "__main__":
    run_predictive_intelligence_audit(days=7)
