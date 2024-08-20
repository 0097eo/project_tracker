from faker import Faker
from config import app, db, bcrypt
from models import Admin, Student, Cohort, Project
from datetime import datetime, timedelta
import random

fake = Faker()

def seed_data():
    # Clear existing data
    print("Clearing existing data...")
    db.drop_all()
    db.create_all()

    # Create admin users
    print("Seeding admins...")
    admins = []
    for _ in range(3):
        admin = Admin(
            username=fake.user_name(),
            email=fake.email(),
            password='password123',
            is_admin=True
        )
        admins.append(admin)
        db.session.add(admin)
    
    db.session.commit()

    # Create cohorts
    print("Seeding cohorts...")
    cohorts = []
    course_types = ['android', 'fullstack']
    for i in range(5):
        start_date = fake.date_between(start_date='-2y', end_date='today')
        cohort = Cohort(
            name=f"Cohort {i+1}",
            start_date=start_date,
            end_date=start_date + timedelta(days=90),
            course_type=random.choice(course_types),
            admin=random.choice(admins)
        )
        cohorts.append(cohort)
        db.session.add(cohort)
    
    db.session.commit()

    # Create students and assign to cohorts
    print("Seeding students...")
    students = []
    for cohort in cohorts:
        for _ in range(10):  # 10 students per cohort
            student = Student(
                username=fake.user_name(),
                email=fake.email(),
                password='password123',
                cohort=cohort
            )
            students.append(student)
            db.session.add(student)
    
    db.session.commit()

    # Create projects and assign to cohorts
    print("Seeding projects...")
    for cohort in cohorts:
        for _ in range(4):  # 4 projects per cohort
            project_owner = random.choice(cohort.students)
            project = Project(
                name=fake.catch_phrase(),
                description=fake.paragraph(),
                github_link=f"https://github.com/{fake.user_name()}/{fake.slug()}",
                cohort=cohort,
                owner_id=project_owner.id
            )
            
            # Add random members to the project from the same cohort
            member_count = random.randint(1, 4)
            project_members = random.sample(cohort.students, member_count)
            project.members.extend(project_members)
            
            db.session.add(project)
    
    db.session.commit()

    print("Seed data created successfully!")

if __name__ == "__main__":
    with app.app_context():
        seed_data()