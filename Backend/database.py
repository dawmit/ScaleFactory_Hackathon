#Database for everything follow structure like below:

from config import db


'''
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=False, nullable=False)
    last_name = db.Column(db.String(80), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
        }
'''

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(80), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "roleName": self.role_name
        }

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    skill_name = db.Column(db.String(80), nullable=False)
    proficiency_level = db.Column(db.String(50), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "skillName": self.skill_name,
            "proficiencyLevel": self.proficiency_level
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "roleId": self.role_id
        }

class UserSkill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "skillId": self.skill_id
        }

class SmartTarget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), nullable=False)
    target_text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="In Progress", nullable=False)
    target_date = db.Column(db.String(20), nullable=True)

    def to_json(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "skillId": self.skill_id,
            "targetText": self.target_text,
            "status": self.status,
            "targetDate": self.target_date
        }