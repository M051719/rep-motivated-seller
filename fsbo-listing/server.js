// server.js
const express = require('express');
const path = require('path');
const listingsRouter = require('./api/listings');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Listings API (with file upload)
app.use('/api/listings', listingsRouter);

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
