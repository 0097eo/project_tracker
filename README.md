# Project Tracker
## Overview
PROJECT TRACKER is a project tracking system designed to help students at any tech school keep a record of their projects over time. The application provides a central repository where students can add, manage, and collaborate on projects, making it easier to access project ideas and find collaborators.
## Features
- Authentication: Secure registration and login system for students and admins.
- Project Management: Add, view, and manage projects, including project details such as name, description, owner, members, and GitHub link.
- Dashboard: A centralized dashboard to view all projects and filter them based on class type (e.g., Android, Fullstack).
- Admin Controls: Admins can add cohorts and manage (add or delete) projects.
- Collaboration: Students can add group members to projects and collaborate effectively.
## Tech Stack
- Backend: Flask (Python)
- Database: SQLAlchemy (SQLite)
- Frontend: ReactJS
- Wireframes: Designed in Figma (Mobile-friendly)
## Installation and setup
### Backend
1. Clone the repository
   ```
   git clone
   ```
2. Create the venv and install the requirements
   ```
   pipenv install
   ```
3. Activate the venv
   ```
   pipenv shell
   ```
4. Run the flask application
   ```
   flask run
   ```
### Frontend
1. Install dependencies
   ```
   cd client
   npm i

   ```
2. Start the react development server
   ```
   npm start
   ```
## Contributing
Contributions are welcome! Please follow these steps:
- Fork the repository.
- Create a feature branch (git checkout -b feature-branch).
- Commit your changes (git commit -am 'Add new feature').
- Push to the branch (git push origin feature-branch).
- Open a Pull Request
  
## License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) 

