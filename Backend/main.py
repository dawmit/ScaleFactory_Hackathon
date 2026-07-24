from flask import request, jsonify
from config import app, db
from database import User, Skill, Role, SmartTarget, UserSkill
from datetime import datetime, timedelta

@app.route('/api/users/<int:user_id>/targets/generate', methods=['POST'])
def generate_user_target(user_id):
    data = request.json
    skill_id = data.get('skill_id')
    
    # 1. Fetch user and skill
    user = User.query.get(user_id)
    skill = Skill.query.get(skill_id)
    
    if not user or not skill:
        return jsonify({"error": "User or Skill not found"}), 404
        
    role = Role.query.get(user.role_id)
    role_name = role.role_name if role else "your target role"

    # 2. Generate the SMART target logic
    generated_data = generate_smart_target(skill.skill_name, role_name)
    
    # 3. Save it to the database
    new_target = SmartTarget(
        user_id=user.id,
        skill_id=skill.id,
        target_text=generated_data["target_text"],
        status="Not Started",
        target_date=generated_data["target_date"]
    )
    
    db.session.add(new_target)
    db.session.commit()
    
    return jsonify({
        "message": "SMART target generated successfully",
        "target": new_target.to_json()
    }), 201

# ==========================================
# 1. AUTHENTICATION / LOGIN
# ==========================================

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user_name = data.get('name')
    
    user = User.query.filter_by(name=user_name).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "message": "Login successful",
        "userId": user.id,
        "isAdmin": getattr(user, 'is_admin', False), # Defaults to False if column missing
        "redirectTarget": "/admin-dashboard" if getattr(user, 'is_admin', False) else "/user-dashboard"
    }), 200


# ==========================================
# 2. ADMIN DASHBOARD ROUTES
# ==========================================

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_json() for user in users]), 200

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    total_users = User.query.count()
    total_skills = Skill.query.count()
    completed_targets = SmartTarget.query.filter_by(status="Completed").count()
    
    return jsonify({
        "totalUsers": total_users,
        "totalSkills": total_skills,
        "completedTargets": completed_targets
    }), 200

@app.route('/api/admin/skills', methods=['POST'])
def create_skill():
    data = request.json
    new_skill = Skill(
        skill_name=data.get('skill_name'),
        proficiency_level=data.get('proficiency_level', 'Beginner')
    )
    db.session.add(new_skill)
    db.session.commit()
    return jsonify(new_skill.to_json()), 201


# ==========================================
# 3. USER DASHBOARD ROUTES
# ==========================================

@app.route('/api/users/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    role = Role.query.get(user.role_id) if user.role_id else None
    
    profile_data = user.to_json()
    profile_data["roleName"] = role.role_name if role else "No Role Assigned"
    
    return jsonify(profile_data), 200

@app.route('/api/users/<int:user_id>/targets', methods=['GET'])
def get_user_targets(user_id):
    targets = SmartTarget.query.filter_by(user_id=user_id).all()
    return jsonify([target.to_json() for target in targets]), 200

@app.route('/api/targets/<int:target_id>/status', methods=['PUT'])
def update_target_status():
    data = request.json
    new_status = data.get('status')
    
    target = SmartTarget.query.get(target_id)
    if not target:
        return jsonify({"error": "Target not found"}), 404
        
    target.status = new_status
    db.session.commit()
    
    return jsonify({"message": "Status updated", "target": target.to_json()}), 200

@app.route('/api/users/<int:user_id>/timeline', methods=['GET'])
def get_user_timeline(user_id):
    targets = SmartTarget.query.filter_by(user_id=user_id).all()
    timeline = []
    
    # If no date is set in DB, we project dates sequentially
    current_projection = datetime.now()
    
    for target in targets:
        if not target.target_date:
            current_projection += timedelta(days=14) # Give 2 weeks per skill
            date_str = current_projection.strftime("%Y-%m-%d")
        else:
            date_str = target.target_date
            
        skill = Skill.query.get(target.skill_id)
            
        timeline.append({
            "targetId": target.id,
            "skillName": skill.skill_name if skill else "Unknown Skill",
            "task": target.target_text,
            "status": target.status,
            "targetDate": date_str
        })
        
    # Sort by date
    timeline.sort(key=lambda x: x["targetDate"])
    return jsonify(timeline), 200

@app.route('/api/users/<int:user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    # 1. Get IDs of skills the user already has or is actively targeting
    existing_skills = [us.skill_id for us in UserSkill.query.filter_by(user_id=user_id)]
    targeted_skills = [st.skill_id for st in SmartTarget.query.filter_by(user_id=user_id)]
    known_skill_ids = set(existing_skills + targeted_skills)
    
    # 2. Find skills they don't have yet
    if known_skill_ids:
        recommended = Skill.query.filter(~Skill.id.in_(known_skill_ids)).limit(3).all()
    else:
        # If they have no skills tracked yet, just recommend the first 3 in the database
        recommended = Skill.query.limit(3).all()
        
    return jsonify([skill.to_json() for skill in recommended]), 200


# ==========================================
# 4. EXTERNAL LEARNING RESOURCES
# ==========================================

@app.route('/api/skills/<int:skill_id>/resources', methods=['GET'])
def get_skill_resources(skill_id):
    skill = Skill.query.get(skill_id)
    if not skill:
        return jsonify({"error": "Skill not found"}), 404
        
    # Fetch from the external_learning.py script
    resources = fetch_all_learning_resources(skill.skill_name)
    
    return jsonify({
        "skillId": skill.id,
        "skillName": skill.skill_name,
        "resources": resources
    }), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port="5000", debug=True)