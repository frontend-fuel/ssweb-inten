const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('./server/models/Course');
const Module = require('./server/models/Module');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate_system');
    console.log('Connected to MongoDB');

    // Clear existing LMS data
    await Course.deleteMany();
    await Module.deleteMany();

    const course = await Course.create({
      title: 'Full Stack Web Development - HTML, CSS, JS, Node.js, MongoDB',
      description: 'Master the complete web development stack from frontend to backend with hands-on projects and industry-standard practices.',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
    });

    const modules = [
      {
        courseId: course._id,
        title: 'Module 1: Modern Frontend Foundations',
        order: 1,
        lessons: [
          { title: 'HTML5 & Semantic Elements', content: '<h3>Welcome to HTML5</h3><p>Learn how to structure your web pages using semantic tags like &lt;header&gt;, &lt;footer&gt;, and &lt;main&gt;.</p>', order: 1 },
          { title: 'CSS3 Layouts: Flexbox & Grid', content: '<h3>Styling with CSS3</h3><p>Master the layout tools that power modern responsive web design.</p>', order: 2 }
        ]
      },
      {
        courseId: course._id,
        title: 'Module 2: JavaScript Mastery',
        order: 2,
        lessons: [
          { title: 'ES6+ Features & Modern Syntax', content: '<h3>The Power of Modern JS</h3><p>Arrow functions, destructuring, and template literals.</p>', order: 1 },
          { title: 'Asynchronous JS: Promises & Async/Await', content: '<h3>Handling Async Operations</h3><p>Learn how to work with APIs and non-blocking code.</p>', order: 2 }
        ]
      },
      {
        courseId: course._id,
        title: 'Module 3: Backend with Node.js & Express',
        order: 3,
        lessons: [
          { title: 'Node.js Core Concepts', content: '<h3>Server-side JS</h3><p>Introduction to Node.js event loop and file system.</p>', order: 1 },
          { title: 'RESTful API Development with Express', content: '<h3>Building APIs</h3><p>Create robust backends with Express.js routes and middleware.</p>', order: 2 }
        ]
      },
      {
        courseId: course._id,
        title: 'Module 4: Database Design with MongoDB',
        order: 4,
        lessons: [
          { title: 'NoSQL Foundations & MongoDB Atlas', content: '<h3>Cloud Databases</h3><p>Storing data in documents with MongoDB.</p>', order: 1 },
          { title: 'Mongoose Schemas & Relationships', content: '<h3>ODM with Mongoose</h3><p>Modeling your data for high-performance applications.</p>', order: 2 }
        ]
      },
      {
        courseId: course._id,
        title: 'Module 5: Capstone Project & Deployment',
        order: 5,
        lessons: [
          { title: 'Building a Full Stack Application', content: '<h3>Putting it all together</h3><p>Develop a complete project using the MERN stack.</p>', order: 1 },
          { title: 'Deployment with Vercel & Heroku', content: '<h3>Going Live</h3><p>Publish your application to the world.</p>', order: 2 }
        ]
      }
    ];

    await Module.insertMany(modules);
    console.log('LMS Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
