const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed'); 

app.use( authRoutes);
app.use(feedRoutes)

mongoose.connect(process.env.MONGO_URI,{
})
.then(() => {
    console.log('MongoDB connected');
  }).catch(err => console.log('MongoDB connection error:', err));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
