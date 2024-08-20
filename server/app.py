from config import app, db
from models import User, Admin, Student, Cohort, Project

if __name__ == '__main__':
    app.run(debug=True)