from datetime import datetime, timedelta

def generate_smart_target(skill_name, role_name="your target role"):
    """
    Generates a simple, template-based SMART target for a given skill.
    """
    # Auto-generate a time-bound date (30 days from today)
    target_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")

    # Construct the SMART components
    specific = f"Acquire practical, hands-on knowledge in {skill_name} and implement a basic proof of concept."
    measurable = f"Complete at least one comprehensive tutorial and build one working mini-project."
    achievable = f"Set aside 2-3 hours per week for focused learning and practice."
    relevant = f"This directly bridges your skill gap and improves your readiness for the {role_name} position."
    time_bound = f"Complete this objective within the next 30 days."

    # Combine into a single structured text block
    target_text = (
        f"Specific: {specific} "
        f"Measurable: {measurable} "
        f"Achievable: {achievable} "
        f"Relevant: {relevant} "
        f"Time-bound: {time_bound}"
    )

    return {
        "target_text": target_text,
        "target_date": target_date
    }