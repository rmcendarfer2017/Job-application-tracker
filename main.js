const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import database setup
const { setupDatabase } = require('./src/backend/database');

// Set up the Express server
const server = express();
const PORT = 3000;

// Configure CORS to allow requests from any origin
server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

server.use(bodyParser.json());

// Add request logging middleware
server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Import and use routes
const jobRoutes = require('./src/backend/routes/jobs');
server.use('/api/jobs', jobRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize the database
setupDatabase();

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the index.html file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'src/frontend/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
