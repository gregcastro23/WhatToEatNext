
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.models import TransitHistory

def analyze_alchemical_balance(db: Session):
    """
    Analyzes the last 7 days of transit_history to identify alchemical imbalances
    and suggests ritual recommendations.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    # Query transit history for the last 7 days
    recent_rituals = db.query(TransitHistory).filter(
        TransitHistory.created_at >= start_date,
        TransitHistory.created_at <= end_date
    ).all()

    if not recent_rituals:
        return {
            "analysis": "No recent ritual history to analyze.",
            "recommendation": None,
        }

    total_spirit_score = 0.0
    total_matter_score = 0.0
    count = 0

    for ritual in recent_rituals:
        if ritual.spirit_score is not None:
            total_spirit_score += ritual.spirit_score
        if ritual.matter_score is not None:
            total_matter_score += ritual.matter_score
        count += 1
    
    if count == 0:
        return {
            "analysis": "No valid scores found in recent ritual history.",
            "recommendation": None,
        }

    avg_spirit_score = total_spirit_score / count
    avg_matter_score = total_matter_score / count

    analysis_message = (
        f"Alchemical Balance Analysis (last 7 days): "
        f"Average Spirit Score: {avg_spirit_score:.2f}, "
        f"Average Matter Score: {avg_matter_score:.2f}."
    )
    recommendation = None

    if avg_matter_score > avg_spirit_score * 1.1: # Matter dominates Spirit by 10%
        recommendation = {
            "type": "Alchemical Axis Restoration",
            "elemental_focus": "Air",
            "ritual_suggestion": "To restore alchemical balance, engage in a high-kinetic 'Air' ritual. Focus on light, airy foods, rapid stirring motions, and dynamic meal preparation to boost Spirit energy.",
            "kinetic_boost_needed": True,
        }
    elif avg_spirit_score > avg_matter_score * 1.1: # Spirit dominates Matter by 10%
        recommendation = {
            "type": "Alchemical Axis Grounding",
            "elemental_focus": "Earth",
            "ritual_suggestion": "To restore alchemical balance, engage in a grounding 'Earth' ritual. Focus on root vegetables, slow cooking methods, and deliberate, mindful preparation to balance Matter energy.",
            "kinetic_boost_needed": False,
        }
    else:
        recommendation = {
            "type": "Alchemical Balance Maintained",
            "elemental_focus": "Balanced",
            "ritual_suggestion": "Your alchemical axis appears balanced. Continue with mindful cooking and ritual.",
            "kinetic_boost_needed": False,
        }

    return {
        "analysis": analysis_message,
        "recommendation": recommendation,
    }

if __name__ == "__main__":
    # This block cannot directly run without a database session.
    # It serves as an example of how the function would be called.
    print("This script is meant to be called from an application context with a database session.")
    print("Example usage: analyze_alchemical_balance(db_session)")
