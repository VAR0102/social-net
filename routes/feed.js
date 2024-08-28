
const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post'); 
const redis = require('redis');
const redisClient = redis.createClient();
const app = express()
app.use(express.json());

async function getPostsFromDB() {
  const posts = await Post.find().populate('userId'); 
  console.log('Fetched posts:', posts);
  return posts;
}



app.get('/feed', async (req, res) => {
  try {
    const posts = await getPostsFromDB();
    console.log('Posts fetched from DB:', posts); 

    if (posts.length === 0) {
      console.log('No posts found in the database.');
    }

    const postsWithAvatars = await Promise.all(posts.map(async (post) => {
      const userId = post.userId._id;

      
      let avatarUrl = await redisClient.get(`avatar:${userId}`);
      let storedInRedis = false;

      if (!avatarUrl) {
        
        const user = await User.findById(userId);
        avatarUrl = user.image;

        await redisClient.setEx(`avatar:${userId}`, 3600, avatarUrl);
        console.log(`Stored avatar for user ${userId} in Redis`);
        storedInRedis = true; 
      }

      return {
        ...post.toObject(), 
        avatarUrl,          
        redisStatus: storedInRedis ? 'Stored in Redis' : 'Fetched from Redis'
      };
    }));

    console.log('Posts with avatars:', postsWithAvatars); 

    res.status(200).json({ message: 'Feed fetched successfully', posts: postsWithAvatars });
  } catch (err) {
    console.error('Error fetching feed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


redisClient.connect().then(() => {
  console.log('Connected to Redis');
});

module.exports = app;
