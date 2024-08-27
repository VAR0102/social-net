const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');

const app = express()
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

app.post('/register', upload.single('image'), async (req, res) => {
    const { name, email, password } = req.body;
    const image = req.file ? req.file.path : null;
  
    try {
   
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({ name, email, password, image });
      await user.save();
  

      const payload = { userId: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  

      res.status(201).json({ token });
    } catch (err) {
      console.error('Error during registration:', err); // Log the error
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

 
  
module.exports = app; 
