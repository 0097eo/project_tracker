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
    

api.add_resource(RefreshToken, '/refresh')
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
if __name__ == '__main__':
    app.run(port=5555, debug=True)