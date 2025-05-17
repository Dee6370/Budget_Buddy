const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
// Use import to get node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Serve static files from the frontend build directory and source directories
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.use(express.static(path.join(__dirname, 'frontend/src')));

// Start Django backend
const startBackend = () => {
  console.log('Starting Django backend...');
  
  const djangoProcess = spawn('python', [
    path.join(__dirname, 'backend/manage.py'),
    'runserver',
    '0.0.0.0:8000'
  ]);

  djangoProcess.stdout.on('data', (data) => {
    console.log(`Django: ${data}`);
  });

  djangoProcess.stderr.on('data', (data) => {
    console.error(`Django Error: ${data}`);
  });

  djangoProcess.on('close', (code) => {
    console.log(`Django process exited with code ${code}`);
    if (code !== 0) {
      // Attempt to restart the backend after a brief delay
      setTimeout(startBackend, 5000);
    }
  });

  return djangoProcess;
};

// Start the Django backend
const djangoProcess = startBackend();

// Handle API requests by proxying to Django backend
app.use('/api', async (req, res) => {
  try {
    const apiUrl = `http://localhost:8000${req.url}`;
    console.log(`Proxying request to: ${apiUrl}`);
    
    // Create headers object from req.headers
    const headers = { ...req.headers };
    headers.host = 'localhost:8000';
    delete headers['content-length']; // Let fetch set this
    
    // Get request body for non-GET requests
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = JSON.stringify(req.body);
      headers['content-type'] = 'application/json';
    }
    
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: headers,
      body: body
    });
    
    // Forward status
    res.status(response.status);
    
    // Forward headers
    response.headers.forEach((value, key) => {
      if (key !== 'transfer-encoding') { // Skip this header as it can cause issues
        res.setHeader(key, value);
      }
    });
    
    // Send response body
    const responseBody = await response.text();
    res.send(responseBody);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error: ' + error.message);
  }
});

// Serve React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (djangoProcess) {
    djangoProcess.kill();
  }
  process.exit();
});

// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
