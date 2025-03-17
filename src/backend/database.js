const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  console.log(`Creating data directory: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'jobtracker.db');
console.log(`Database path: ${dbPath}`);

// Check if database file exists
if (fs.existsSync(dbPath)) {
  console.log(`Database file exists: ${dbPath}`);
} else {
  console.log(`Database file does not exist, will be created: ${dbPath}`);
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Set up the database schema
function setupDatabase() {
  console.log('Setting up database...');
  
  db.serialize(() => {
    // Create jobs table
    db.run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        jobDescription TEXT,
        applicationLink TEXT,
        salaryMin INTEGER,
        salaryMax INTEGER,
        applicationDate TEXT,
        status TEXT DEFAULT 'Applied',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create contacts table for networking
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        linkedin TEXT,
        notes TEXT,
        FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
      )
    `);

    console.log('Database setup complete');
  });
}

module.exports = {
  db,
  setupDatabase
};
