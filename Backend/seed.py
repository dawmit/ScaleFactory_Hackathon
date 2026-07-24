# Import your Flask app, db instance, and models
# Adjust 'app' to whatever file initializes your Flask app (e.g., from main import app, db, Role...) 
from config import db, app
from database import Role, Skill, User, UserSkill, SmartTarget

def seed_database():
    # Flask requires an application context to interact with the database
    with app.app_context():
        # Clear existing data to avoid duplicates when running multiple times
        db.drop_all()
        
        # Create all tables based on your models
        db.create_all()

        print("Seeding Roles...")
        # Defining the roles based on the consultant view requirements
        role_java = Role(role_name="Java Developer")
        role_tester = Role(role_name="Manual Tester")
        role_admin = Role(role_name="Academy Lead") # Dedicated role for Admin view
        
        db.session.add_all([role_java, role_tester, role_admin])
        db.session.commit()

        print("Seeding Skills...")
        # --- Java Developer Skills ---
        # Categorized by level/difficulty as per "The Matrix" requirement
        j_skill1 = Skill(skill_name="Modern Java & OOP Principles", proficiency_level="Advanced")
        j_skill2 = Skill(skill_name="Spring Framework & Spring Boot", proficiency_level="Intermediate")
        j_skill3 = Skill(skill_name="Relational & NoSQL Databases", proficiency_level="Intermediate")
        j_skill4 = Skill(skill_name="Testing Frameworks (JUnit/Mockito)", proficiency_level="Beginner")
        j_skill5 = Skill(skill_name="Build & CI/CD tools", proficiency_level="Beginner")

        # --- Manual Tester Skills ---
        t_skill1 = Skill(skill_name="Test Case Design & STLC", proficiency_level="Advanced")
        t_skill2 = Skill(skill_name="API Testing & Verification", proficiency_level="Intermediate")
        t_skill3 = Skill(skill_name="Defect Life Cycle & Management", proficiency_level="Advanced")
        t_skill4 = Skill(skill_name="Exploratory & Edge-Case Testing", proficiency_level="Intermediate")
        t_skill5 = Skill(skill_name="Database & SQL Verification", proficiency_level="Beginner")
        
        db.session.add_all([
            j_skill1, j_skill2, j_skill3, j_skill4, j_skill5, 
            t_skill1, t_skill2, t_skill3, t_skill4, t_skill5
        ])
        db.session.commit()

        print("Seeding Users (Consultants & Admin)...")
        # Creating an Admin (Academy Lead) and a couple of Consultants
        admin_user = User(name="Academy Lead", role_id=role_admin.id)
        user_java = User(name="Alice (Java Dev)", role_id=role_java.id)
        user_tester = User(name="Bob (Manual Tester)", role_id=role_tester.id)
        
        db.session.add_all([admin_user, user_java, user_tester])
        db.session.commit()

        print("Seeding UserSkills (Matrix Progress)...")
        # Alice (Java Dev) already has some skills mastered
        us1 = UserSkill(user_id=user_java.id, skill_id=j_skill1.id)
        us2 = UserSkill(user_id=user_java.id, skill_id=j_skill3.id)
        
        # Bob (Tester) has experience in test case design and defect life cycles
        us3 = UserSkill(user_id=user_tester.id, skill_id=t_skill1.id)
        us4 = UserSkill(user_id=user_tester.id, skill_id=t_skill3.id)
        
        db.session.add_all([us1, us2, us3, us4])
        db.session.commit()

        print("Seeding SMART Targets...")
        # Linking to Timeline statuses: "Completed" (Mastered), "In Progress" (Learning), "Not Started" (Uncomplete)
        
        # Alice's SMART Goals
        target1 = SmartTarget(
            user_id=user_java.id,
            skill_id=j_skill2.id,
            target_text="Specific: Build a REST API. Measurable: Must have 4 CRUD endpoints. Achievable: Use Spring Boot starter. Relevant: Core Java Dev skill. Time-bound: End of Q2.",
            status="In Progress", # Learning
            target_date="2026-08-01"
        )
        
        target2 = SmartTarget(
            user_id=user_java.id,
            skill_id=j_skill4.id,
            target_text="Write Mockito unit tests for the newly created Spring Boot API achieving 80% coverage by end of Q3.",
            status="Not Started", # Uncomplete
            target_date="2026-10-01"
        )

        # Bob's SMART Goals
        target3 = SmartTarget(
            user_id=user_tester.id,
            skill_id=t_skill2.id,
            target_text="Specific: Learn Postman for API Verification. Measurable: Write 10 automated test collections. Time-bound: By next sprint review.",
            status="Completed", # Mastered
            target_date="2026-06-15"
        )

        target4 = SmartTarget(
            user_id=user_tester.id,
            skill_id=t_skill5.id,
            target_text="Complete a 4-hour advanced SQL tutorial and verify DB states for 3 staging tickets by end of month.",
            status="In Progress", # Learning
            target_date="2026-08-15"
        )
        
        db.session.add_all([target1, target2, target3, target4])
        db.session.commit()

        print("Database seeded successfully with targeted roles, skills, and SMART goals!")

if __name__ == "__main__":
    seed_database()