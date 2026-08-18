const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Temporary in-memory storage (replace with a real database later)
let items = [];
let nextId = 1;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Create a new lost item report
app.post('/api/items', (req, res) => {
  const { name, description, category, location, date } = req.body;

  if (!name || !description || !category || !location || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newItem = {
    id: nextId++,
    name,
    description,
    category,
    location,
    date,
    status: 'lost',
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  console.log('New item reported:', newItem);

  res.status(201).json(newItem);
});

// Get all reported items
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});