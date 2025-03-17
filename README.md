# Job Application Tracker

A desktop application to help you track and manage your job applications.

## Features

- Add and manage job applications
- Track application status (Applied, Waiting, Interviewing, Rejected)
- Store networking contacts for each job
- View application statistics on the dashboard
- Local data storage for privacy

## Technologies Used

- Frontend: Electron.js with HTML, CSS, and JavaScript
- Backend: Node.js with Express.js
- Database: SQLite (local storage)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/job-application-tracker.git
   cd job-application-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

## Database Setup

The application will automatically create a SQLite database in the `data` directory when it first runs. No additional setup is required.

## Development

### Project Structure

- `main.js` - Main Electron application file
- `src/frontend/` - Frontend HTML, CSS, and JavaScript
- `src/backend/` - Backend Express server and API routes
- `data/` - SQLite database (not included in the repository)

### Adding New Features

1. Backend changes should be made in the `src/backend/` directory
2. Frontend changes should be made in the `src/frontend/` directory
3. Database schema changes should be made in `src/backend/database.js`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT
