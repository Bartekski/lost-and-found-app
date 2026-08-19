const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./db');
const Item = require('./models/Item');
const User = require('./models/User');
const requireAuth = require('./middleware/auth');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 3000;

const N8N_WEBHOOK_URL = 'https://looooooost.app.n8n.cloud/webhook/99c328c7-2342-4d19-a777-68fdd3305fa4';

app.use(cors());
app.use(express.json());

connectDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ---------- AUTH ROUTES ----------
// Get messages for a specific item
app.get('/api/items/:id/messages', requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({ itemId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message on a specific item
app.post('/api/items/:id/messages', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text is required' });

    const user = await User.findById(req.userId);

    const message = await Message.create({
      itemId: req.params.id,
      senderId: req.userId,
      senderName: user.name,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'venue' ? 'venue' : 'guest',
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (address !== undefined) updates.address = address;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- VENUE ROUTES ----------

app.get('/api/venues', async (req, res) => {
  try {
    const venues = await User.find({ role: 'venue' }).select('name _id');
    res.json(venues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- ITEM ROUTES ----------

// Create a new lost item report (protected, requires venueId)
app.post('/api/items', requireAuth, async (req, res) => {
  try {
    const { name, description, category, location, date, venueId } = req.body;

    if (!name || !description || !category || !location || !date || !venueId) {
      return res.status(400).json({ error: 'All fields including venue are required' });
    }

    const newItem = await Item.create({
      name,
      description,
      category,
      location,
      date,
      userId: req.userId,
      venueId,
    });

    console.log('New item reported:', newItem);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get only the logged-in user's own items
app.get('/api/items', requireAuth, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ALL items belonging to the logged-in venue (venue dashboard)
app.get('/api/items/all', requireAuth, async (req, res) => {
  try {
    if (req.userRole !== 'venue') {
      return res.status(403).json({ error: 'Only venue accounts can view all items' });
    }

    const items = await Item.find({ venueId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an item (e.g. mark as found) - venue only, triggers n8n notification
app.put('/api/items/:id', requireAuth, async (req, res) => {
  try {
    if (req.userRole !== 'venue') {
      return res.status(403).json({ error: 'Only venue accounts can update items' });
    }

    const { status } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('Item updated:', updatedItem);

    // Trigger n8n notification when marked as found
    if (status === 'found') {
      const guest = await User.findById(updatedItem.userId);
      const venue = await User.findById(updatedItem.venueId);

      if (guest) {
        fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestEmail: guest.email,
            guestName: guest.name,
            itemName: updatedItem.name,
            venueName: venue ? venue.name : 'the venue',
          }),
        }).catch(err => console.error('Failed to trigger n8n webhook:', err));
      }
    }

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an item - owner or venue
app.delete('/api/items/:id', requireAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const isOwner = item.userId.toString() === req.userId;
    const isVenue = req.userRole === 'venue';

    if (!isOwner && !isVenue) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});