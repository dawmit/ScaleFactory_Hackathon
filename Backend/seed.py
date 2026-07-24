# Import your Flask app, db instance, and models
# Adjust 'app' to whatever file initializes your Flask app (e.g., from main import app, db, Role...) 
from config import db, app
from database import Role, Skill, User, UserSkill, SmartTarget

def seed_database():
    # Flask requires an application context to interact with the database
    with app.app_context():
        # Optional: Clear existing data to avoid duplicates when running multiple times
        db.drop_all()
        
        # Create all tables based on your models
        db.create_all()

        print("Seeding Roles...")
        role1 = Role(role_name="Frontend Developer")
        role2 = Role(role_name="Backend Developer")
        role3 = Role(role_name="Data Engineer")
        
        db.session.add_all([role1, role2, role3])
        db.session.commit() # Commit now so we can use their generated IDs

        print("Seeding Skills...")
        skill1 = Skill(skill_name="React", proficiency_level="Intermediate")
        skill2 = Skill(skill_name="Python", proficiency_level="Advanced")
        skill3 = Skill(skill_name="Docker", proficiency_level="Beginner")
        skill4 = Skill(skill_name="SQL", proficiency_level="Intermediate")
        
        db.session.add_all([skill1, skill2, skill3, skill4])
        db.session.commit()

        print("Seeding Users...")
        user1 = User(name="Alice Smith", role_id=role1.id)
        user2 = User(name="Bob Jones", role_id=role2.id)
        user3 = User(name="Charlie Brown", role_id=role3.id)
        
        db.session.add_all([user1, user2, user3])
        db.session.commit()

        print("Seeding UserSkills...")
        # Alice knows React and a bit of Docker
        us1 = UserSkill(user_id=user1.id, skill_id=skill1.id)
        us2 = UserSkill(user_id=user1.id, skill_id=skill3.id)
        
        # Bob knows Python and SQL
        us3 = UserSkill(user_id=user2.id, skill_id=skill2.id)
        us4 = UserSkill(user_id=user2.id, skill_id=skill4.id)
        
        db.session.add_all([us1, us2, us3, us4])
        db.session.commit()

        print("Seeding SmartTargets...")
        # Alice's goal is to improve her Docker skills
        target1 = SmartTarget(
            user_id=user1.id,
            skill_id=skill3.id,
            target_text="Complete 'Docker for Beginners' course and containerize the frontend app.",
            status="In Progress",
            target_date="2026-10-15"
        )
        
        # Bob's goal is to learn React
        target2 = SmartTarget(
            user_id=user2.id,
            skill_id=skill1.id,
            target_text="Build a simple full-stack app using React and Flask.",
            status="Not Started",
            target_date="2026-12-01"
        )
        
        db.session.add_all([target1, target2])
        db.session.commit()

        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()