// listings.js
// PostgreSQL-powered API for FSBO listings

const pool = require('../db');
const upload = require('./upload-middleware');
const path = require('path');


// Express-style handler for file upload
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM listings ORDER BY created_at DESC';
    let params = [];
    if (req.query.featured) {
      query = 'SELECT * FROM listings ORDER BY created_at DESC LIMIT 3';
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.post('/', upload.array('photos', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const photoUrls = files.map(f => '/uploads/' + path.basename(f.path));
    const fields = req.body;
    const insert = await pool.query(
      `INSERT INTO listings (
        user_id, owner_name, address, phone, price, bedrooms, bathrooms, sqft, lot_size, year_built, year_remodeled, property_condition, financing, features, photos
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *`,
      [
        null, // user_id (add real user id if available)
        fields.ownerName || 'Unknown',
        fields.address || '',
        fields.phone || '',
        Number(fields.price) || 0,
        Number(fields.bedrooms) || 0,
        Number(fields.bathrooms) || 0,
        Number(fields.sqft) || 0,
        Number(fields.lotSize) || 0,
        Number(fields.yearBuilt) || 0,
        Number(fields.yearRemodeled) || 0,
        fields.propertyCondition || '',
        fields.financing || '',
        fields.features || '',
        photoUrls
      ]
    );
    res.status(201).json({ message: 'Listing added', listing: insert.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add listing' });
  }
});

module.exports = router;