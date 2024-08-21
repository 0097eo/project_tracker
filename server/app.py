from config import app, db, api
from models import User, Admin, Student, Cohort, Project
from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from sqlalchemy import or_
from datetime import timedelta, datetime
import secrets
from email.mime.text import MIMEText
import smtplib


class Signup(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return {'error': 'Missing username, email, or password'}, 400

        if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
            return {'error': 'Username or email already exists'}, 400

        # Generate a random verification code
        verification_code = secrets.token_hex(3)

        new_user = Student(username=username, email=email, password=password, verification_code=verification_code, is_verified=False)
        db.session.add(new_user)
        db.session.commit()

        try:
            send_verification_email(email, verification_code)
            return {'message': 'Verification email sent. Please check your inbox.'}, 201
        except Exception as e:
            # Handle email sending error
            db.session.delete(new_user)
            db.session.commit()
            return {'error': 'Failed to send verification email.'}, 500

def send_verification_email(email, verification_code):
    sender = 'emmanuelokello294@gmail.com'
    recipient = email
    subject = 'Verify your email'
    body = f'Your verification code is: {verification_code}'

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login('emmanuelokello294@gmail.com', 'quzo ygrw gcse maim')
            smtp.send_message(msg)
    except smtplib.SMTPException as e:
        print(f"Error sending verification email: {e}")
        raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise e
    
class VerifyEmail(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        verification_code = data.get('verification_code')

        if not email or not verification_code:
            return {'error': 'Missing email or verification code'}, 400

        user = User.query.filter_by(email=email).first()

        if not user or user.verification_code != verification_code:
            return {'error': 'Invalid email or verification code'}, 401

        user.is_verified = True
        user.verification_code = None
        db.session.commit()

        return {'message': 'Email verified successfully'}, 200


class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {'error': 'Missing username or password'}, 400

        user = User.query.filter(or_(User.username == username, User.email == username)).first()

        if not user or not user.check_password(password):
            return {'error': 'Invalid username or password'}, 401

        access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=10))
        refresh_token = create_refresh_token(identity=user.id)

        return {
            'access_token': access_token,
           'refresh_token': refresh_token
        }, 200
    
class RefreshToken(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity, expires_delta=timedelta(days=10))
        return {'access_token': access_token}
    
class CohortResource(Resource):
    @jwt_required()
    def get(self):
        course_type = request.args.get('course_type')
        
        if course_type:
            cohorts = Cohort.query.filter_by(course_type=course_type).all()
        else:
            cohorts = Cohort.query.all()

        cohort_list = []
        for cohort in cohorts:
            cohort_data = {
                "id": cohort.id,
                "name": cohort.name,
                "start_date": cohort.start_date.strftime('%Y-%m-%d'),
                "end_date": cohort.end_date.strftime('%Y-%m-%d'),
                "course_type": cohort.course_type,
                "admin": cohort.admin.username,
                "students": [student.username for student in cohort.students],
                "projects": [project.name for project in cohort.projects],
            }
            cohort_list.append(cohort_data)

        return {"cohorts": cohort_list}, 200

class ProjectResource(Resource):
    @jwt_required()
    def post(self):
        user = Student.query.get(get_jwt_identity())

        if user.is_admin == 1:
            return {'error': 'Only students can create projects.'}, 403

        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        github_link = data.get('github_link')

        if not name or not description or not github_link:
            return {'error': 'Missing project name, description, or GitHub link'}, 400

        new_project = Project(
            name=name,
            description=description,
            github_link=github_link,
            cohort_id=user.cohort_id,  # Accessing cohort_id from the Student
            owner_id=user.id
        )

        new_project.members.append(user)  # Add the creator as the first member

        db.session.add(new_project)
        db.session.commit()

        return {'message': 'Project created successfully'}, 201

    @jwt_required()
    def put(self, project_id):
        user = User.query.get(get_jwt_identity())

        project = Project.query.get(project_id)

        if not project:
            return {'error': 'Project not found'}, 404


        data = request.get_json()
        member_usernames = data.get('member_usernames')

        if not member_usernames:
            return {'error': 'No member usernames provided'}, 400

        for username in member_usernames:
            member = Student.query.filter_by(username=username).first()
            if member and member not in project.members:
                project.members.append(member)

        db.session.commit()

        return {'message': 'Members added successfully'}, 200
    

class AdminCohortResource(Resource):
    @jwt_required()
    def post(self):
        user = Admin.query.get(get_jwt_identity())

        if not user or not user.is_admin:
            return {'error': 'Only admins can add cohorts.'}, 403

        data = request.get_json()
        name = data.get('name')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        course_type = data.get('course_type')

        if not name or not start_date or not end_date or not course_type:
            return {'error': 'Missing cohort name, start date, end date, or course type'}, 400

        new_cohort = Cohort(
            name=name,
            start_date=datetime.strptime(start_date, '%Y-%m-%d').date(),
            end_date=datetime.strptime(end_date, '%Y-%m-%d').date(),
            course_type=course_type,
            admin_id=user.id
        )

        db.session.add(new_cohort)
        db.session.commit()

        return {'message': 'Cohort added successfully'}, 201

class AdminProjectResource(Resource):
    @jwt_required()
    def post(self):
        user = Admin.query.get(get_jwt_identity())

        if not user or not user.is_admin:
            return {'error': 'Only admins can add projects.'}, 403

        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        github_link = data.get('github_link')
        cohort_id = data.get('cohort_id')
        owner_id = data.get('owner_id')

        if not name or not description or not github_link or not cohort_id or not owner_id:
            return {'error': 'Missing project name, description, GitHub link, cohort ID, or owner ID'}, 400

        new_project = Project(
            name=name,
            description=description,
            github_link=github_link,
            cohort_id=cohort_id,
            owner_id=owner_id
        )

        db.session.add(new_project)
        db.session.commit()

        return {'message': 'Project added successfully'}, 201

    @jwt_required()
    def delete(self, project_id):
        user = Admin.query.get(get_jwt_identity())

        if not user or not user.is_admin:
            return {'error': 'Only admins can delete projects.'}, 403

        project = Project.query.get(project_id)

        if not project:
            return {'error': 'Project not found'}, 404

        db.session.delete(project)
        db.session.commit()

        return {'message': 'Project deleted successfully'}, 200
    
class ProjectListResource(Resource):
    @jwt_required()
    def get(self):
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Paginate the projects query
        pagination = Project.query.paginate(page=page, per_page=per_page, error_out=False)
        projects = pagination.items

        project_list = []
        for project in projects:
            owner = Student.query.get(project.owner_id)
            owner_name = owner.username if owner else 'Unknown'  # Default to 'Unknown' if owner not found

            members = [member.username for member in project.members]
            # Ensure the owner is the first member
            if owner_name in members:
                members.remove(owner_name)
            members = [owner_name] + members

            project_data = {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "github_link": project.github_link,
                "cohort": project.cohort.name,
                "owner_id": project.owner_id,
                "owner_name": owner_name,
                "members": members,
                "created_at": project.created_at.strftime('%Y-%m-%d'),
                "updated_at": project.updated_at.strftime('%Y-%m-%d'),
            }
            project_list.append(project_data)

        return {
            "total_projects": pagination.total,
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "per_page": pagination.per_page,
            "projects": project_list
        }, 200
    
class UserResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {'error': 'User not found'}, 404

        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_admin,
            'is_verified': user.is_verified,
            'created_at': user.created_at.isoformat(),
            'updated_at': user.updated_at.isoformat()
        }

        if user.is_admin:
            admin = Admin.query.get(user.id)
            if admin:
                # Fetch cohorts managed by this admin
                cohorts = Cohort.query.filter_by(admin_id=admin.id).all()
                user_data['cohorts'] = [{'id': cohort.id, 'name': cohort.name} for cohort in cohorts]
            else:
                user_data['cohorts'] = []
        else:
            student = Student.query.get(user.id)
            if student:
                user_data['cohort'] = {'id': student.cohort.id, 'name': student.cohort.name} if student.cohort else None
                user_data['projects'] = [{'id': project.id, 'name': project.name} for project in student.projects]
            else:
                user_data['cohort'] = None
                user_data['projects'] = []

        return user_data, 200
    
class StudentsResource(Resource):
    @jwt_required()
    def get(self):
        students = Student.query.all()
        return {
            'students': [
                {
                    'id': student.id,
                    'username': student.username,
                    'email': student.email
                } for student in students
            ]
        }, 200

api.add_resource(StudentsResource, '/students')
api.add_resource(UserResource, '/user')
api.add_resource(ProjectListResource, '/projects/all')
api.add_resource(AdminCohortResource, '/admin/cohorts')
api.add_resource(AdminProjectResource, '/admin/projects', '/admin/projects/<project_id>')
api.add_resource(ProjectResource, '/projects', '/projects/<project_id>')
api.add_resource(CohortResource, '/cohorts')
api.add_resource(RefreshToken, '/refresh')
api.add_resource(Signup, '/signup')
api.add_resource(VerifyEmail, '/verify-email')
api.add_resource(Login, '/login')
if __name__ == '__main__':
    app.run(port=5555, debug=True)