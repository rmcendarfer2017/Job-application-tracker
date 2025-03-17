# Job Application Tracking System

A desktop application to help you track and manage your job applications efficiently.

## Features

- **Add Job Opportunities**: Log details about job applications
- **Track Application Status**: Update job status (Applied, Waiting, Interviewing, Rejected)
- **Store Application Details**: Save company name, job title, application link, salary range, etc.
- **Networking Contacts**: Store names and contact information for potential referrals
- **Dashboard**: View statistics about your job search progress
- **Local Storage**: All data is stored locally on your device

## Technology Stack

- **Frontend**: Electron.js with HTML, CSS, and JavaScript
- **Backend**: Node.js with Express.js
- **Database**: SQLite for local data storage

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

2. Clone or download this repository.

3. Open a terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all the required dependencies.

## Running the Application

To start the application, run:

```bash
npm start
```

This will launch the Electron application with the job tracker interface.

## Development

For development with auto-reload, run:

```bash
npm run dev
```

## Usage Guide

### Adding a Job Application

1. Click the "Add New Job" button in the header.
2. Fill in the job details form.
3. Click "Save Job" to add the application to your tracker.

### Viewing Job Details

Click on any job card in the list to view its complete details.

### Adding Networking Contacts

1. Open a job's details by clicking on its card.
2. Click the "Add Contact" button in the Networking Contacts section.
3. Fill in the contact information.
4. Click "Save Contact" to add the contact to the job.

### Filtering Jobs

Use the dropdown menu and search box above the job list to filter jobs by status or search for specific companies/roles.

## Data Storage

All your data is stored locally in a SQLite database file located in the `data` directory of the application. No data is sent to any external servers.

## License

MIT
