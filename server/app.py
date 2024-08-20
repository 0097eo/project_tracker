from config import app, db, api
from models import User, Admin, Student, Cohort, Project
from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from sqlalchemy import or_
from datetime import timedelta, datetime


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

        new_user = User(username=username, email=email, password=password) and Student(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        return {'message': 'User created successfully'}, 201


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


    
api.add_resource(CohortResource, '/cohorts')
api.add_resource(RefreshToken, '/refresh')
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
if __name__ == '__main__':
    app.run(port=5555, debug=True)