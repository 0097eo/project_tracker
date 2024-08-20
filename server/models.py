from config import db, bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def password(self):
        return self._password

    @password.setter
    def password(self, plaintext_password):
        self._password = bcrypt.generate_password_hash(plaintext_password).decode('utf-8')

    def check_password(self, plaintext_password):
        return bcrypt.check_password_hash(self._password, plaintext_password)

class Admin(User):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    cohorts = db.relationship('Cohort', backref='admin', lazy=True)

    __mapper_args__ = {
        'polymorphic_identity': 'admin',
    }

class Student(User):
    __tablename__ = 'students'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    cohort_id = db.Column(db.Integer, db.ForeignKey('cohorts.id'))
    projects = db.relationship('Project', secondary='student_projects', back_populates='members')

    __mapper_args__ = {
        'polymorphic_identity': 'student',
    }

class Cohort(db.Model):
    __tablename__ = 'cohorts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    course_type = db.Column(db.String(50), nullable=False)  # 'android' or 'fullstack'
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=False)
    students = db.relationship('Student', backref='cohort', lazy=True)
    projects = db.relationship('Project', backref='cohort', lazy=True)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    github_link = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cohort_id = db.Column(db.Integer, db.ForeignKey('cohorts.id'), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    members = db.relationship('Student', secondary='student_projects', back_populates='projects')

student_projects = db.Table('student_projects',
    db.Column('student_id', db.Integer, db.ForeignKey('students.id'), primary_key=True),
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True)
)