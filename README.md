Youth Freelance Marketplace
Empowering African Youth to Reach Freelance Opportunities
Youth Freelance Marketplace is a digital platform that matches freelance youth with clients seeking digital services and professional skills. The platform is a chance for the youth to display their skills, find projects as well as get hands on experience of working for the client while the client gets the best talent for their project.
The project aims to tackle youth unemployment by developing a digital platform that encourages skills building, small business creation, and freelance job opportunities for youth.
1. Project Overview
Unemployment among the young is a major problem in Africa. Many young graduates and job seekers have academic qualifications but are short of working experience and is unable to demonstrate their skills.
YouthFreelanceMarketplace's approach to this challenge is to offer an online marketplace that allows for the exchange of skills where:
Freelancers can build a professional profile and feature their skills.
Clients can post their projects and attract a suitable freelance workforce.
Freelancers can apply to available projects.
Administrators can monitor and manage activities on the platform.
The platform features a modern and easy-to-use interface.

2. Project Objectives
The overall goals of YouthFreelanceMarketplace are to:
Match young freelancers and clients who are looking for digital and professional services.
Provide freelancers with opportunities to showcase their skills and experience.
Connect clients with qualified people for their projects.
Promote practical learning and professional development.
Promote young people in the world of entrepreneurship and self-employment.
Help tackle youth unemployment by using digital opportunities.
3. Key Features
3.1 User Registration and Authentication
Enabling user registration and login.
Role-based access for freelancers, clients and administrators.
Secure password hashing.
Access token based authentication.
Protected application pages.
3.2 Freelancer Features
Create and manage a freelancer profile.
Include information about personal and professional interests.
Demonstrate skills, education, and experience.
Add portfolio information.
Browse available projects.
Apply for appropriate projects.
3.3 Client Features
Set up and maintain client account.
Develop and maintain freelance projects.
Include project descriptions, budgets, categories and needed skills.
View and manage projects that have been posted.
Use the site's capabilities to find freelancers.
3.4 Administrator Features
Open the administrator's console.
Oversee platform activities.
Manage and monitor marketplace information.
3.5 Project Marketplace
Go through offers of freelance projects.
See descriptions and requirements for projects.
Locate projects by appropriate skills.
Research project information before applying.
4. Technologies Used
The project uses the following technologies:
Component
Technology
Frontend
React.js
Frontend build tool
Vite
Styling
CSS
Backend
Python
Backend framework
Flask
Database
SQLite
API communication
REST API
Authentication
Token-based authentication
Password security
Werkzeug password hashing
Frontend hosting
Vercel
Backend hosting
Render
Version control
Git
Source code repository
GitHub
Development environment
Visual Studio Code

5. System Architecture
YouthFreelanceMarketplace is a client-server application.
The front end sends and receives data from the back end via HTTP requests to REST API endpoints. The Flask backend handles requests, user authentication, application logic and interacts with the SQLite database.
The general system flow is:
+---------------------------+
|       User Browser        |
|                           |
|   React + Vite Frontend   |
|        (Vercel)           |
+-------------+-------------+
              |
              | HTTP Requests
              | REST API
              v
+---------------------------+
|       Flask Backend       |
|         (Render)          |
|                           |
| Authentication            |
| Business Logic            |
| API Endpoints             |
+-------------+-------------+
              |
              | Database Queries
              v
+---------------------------+
|       SQLite Database     |
|                           |
| User and Project Data     |
+---------------------------+
6. Project Structure
The project is organized into separate frontend and backend directories.
Youth_Freelance_Marketplace/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.production
│   ├── package.json
│   └── index.html
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── app.py
│   ├── auth.py
│   ├── config.py
│   ├── models.py
│   ├── requirements.txt
│   ├── .env
│   └── marketplace.db
│
├── .gitignore
├── README.md
└── ...
N.B.: Be informed that this is the main structure; there are some directories not included for easy understanding.
7. Installation and Setup
Follow these instructions to run YouthFreelanceMarketplace locally.
7.1 Prerequisites
Before starting, ensure that you have installed:
Python 3.
Node.js and npm.
Git.
Visual Studio Code (recommended).
7.2 Clone the Repository
Open your terminal and run:
git clone https://github.com/kguido798/Youth_Freelance_Marketplace.git
Navigate into the project:
cd Youth_Freelance_Marketplace
7.3 Backend Setup
Navigate to the backend directory:
cd backend
Create a Python virtual environment:
python -m venv .venv
Activate the virtual environment on Windows PowerShell:
.\.venv\Scripts\Activate.ps1
Install the backend dependencies:
pip install -r requirements.txt
Create a .env file inside the backend directory.
Add the following environment variable:
SECRET_KEY=your_secure_secret_key
Replace the example value with a secure value

