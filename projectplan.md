Project Plan: Job Application Tracking System

1. Project Overview:
The Job Application Tracking System is a local web application designed to help users manage and track their job applications efficiently. The system will allow users to log job opportunities, store application details, track progress, and visualize key job application metrics. The application will be installed and run locally, with data stored on the user's device.

2. Features & Functionality:

Core Features:

Add Job Opportunity: Users can input details about job applications.

Application Link Storage: Users can store URLs of job applications.

Company & Role Details: Users can add the company name and job title.

Networking Contacts: Users can store names and links to potential referrals.

Application Date: Users can track when they applied for each job.

Job Description & Salary: Users can save the job description and salary range.

Application Status: Users can update job status with options: Applied, Rejected, Waiting, Interviewing.

Dashboard Features:

Total Applications Count: Displays the number of jobs the user has applied to.

Interview Ratio: Displays a percentage of interviews to applications sent.

3. Technology Stack:

Frontend: Electron.js with a modern UI framework (Material UI or Tailwind CSS)

Backend: Node.js with Express.js (running locally)

Database: SQLite for local data storage

Hosting: Runs as a local desktop application (no cloud dependencies)

4. System Architecture:

Frontend: Desktop UI using Electron.js.

Backend API: Local REST API with CRUD endpoints for managing job applications.

Database: SQLite file-based database stored on the user’s machine.

5. User Flow:

User installs the application.

User adds a new job application with required details.

User updates the job status as progress changes.

Dashboard visualizes job search progress.