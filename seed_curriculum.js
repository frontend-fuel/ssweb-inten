const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('./server/models/Course');

dotenv.config();

const curriculum = [
    {
        title: "1. HTML5 (Structure & Accessibility)",
        lessons: [
            { title: "Semantic Layout", content: "Using <header>, <main>, <footer>, <section>, and <article> for SEO and screen readers." },
            { title: "Advanced Forms", content: "Utilizing datalist, output, and specific input types (tel, url, date)." },
            { title: "Client-Side Validation", content: "Mastering attributes like pattern (Regex), required, and minlength." },
            { title: "Web Storage API", content: "Deep dive into localStorage vs. sessionStorage." },
            { title: "Audio & Video API", content: "Customizing media players beyond the default browser controls." },
            { title: "Canvas API", content: "Understanding how to draw 2D graphics and animations directly in the browser." },
            { title: "SEO Metadata", content: "Configuring Open Graph tags and JSON-LD for rich search results." }
        ]
    },
    {
        title: "2. CSS3 (Design & Layout)",
        lessons: [
            { title: "Flexbox Mastery", content: "Understanding alignment, wrapping, and the flex-basis property." },
            { title: "CSS Grid", content: "Implementing complex 2D layouts and naming grid areas." },
            { title: "CSS Variables", content: "Managing global themes and dynamic styles using --variable-name." },
            { title: "Responsive Design", content: "Using clamp(), min(), and max() for fluid typography and scaling." },
            { title: "Animations & Keyframes", content: "Creating high-performance UI transitions." },
            { title: "Box Model Mastery", content: "Understanding content-box vs. border-box and margin collapsing." },
            { title: "Pseudo-elements", content: "Creative use of ::before and ::after for decorative UI components." }
        ]
    },
    {
        title: "3. JavaScript (Logic & Engine)",
        lessons: [
            { title: "Closures & Lexical Scope", content: "How functions remember their environment." },
            { title: "Asynchronous JS", content: "Mastering Promises and the Async/Await pattern." },
            { title: "The DOM Tree", content: "Efficiently traversing, selecting, and manipulating elements." },
            { title: "Event Loop", content: "Understanding how JS handles concurrency (Call Stack, Task Queue)." },
            { title: "ES6+ Features", content: "Destructuring, Spread/Rest operators, and Template Literals." },
            { title: "Array Methods", content: "Practical application of .map(), .filter(), and .reduce()." },
            { title: "Error Handling", content: "Using try...catch and creating custom error boundaries." }
        ]
    },
    {
        title: "4. Node.js (Server Environment)",
        lessons: [
            { title: "Event-Driven Architecture", content: "Using the EventEmitter class for custom events." },
            { title: "File System (FS)", content: "Performing non-blocking I/O operations (reading/writing files)." },
            { title: "NPM Ecosystem", content: "Managing dependencies, versioning (semantic versioning), and npx." },
            { title: "Environment Variables", content: "Using process.env to protect sensitive keys." },
            { title: "Streams & Buffers", content: "Handling large data transfers (like file uploads) without crashing memory." },
            { title: "CommonJS vs. ES Modules", content: "Navigating require vs. import." },
            { title: "HTTP Module", content: "Understanding how Node creates a server from scratch before using frameworks." }
        ]
    },
    {
        title: "5. Express.js (Backend Framework)",
        lessons: [
            { title: "Middleware Pattern", content: "Creating functions that run between the request and response." },
            { title: "RESTful Routing", content: "Designing clean APIs (GET, POST, PUT, DELETE)." },
            { title: "Request Parsing", content: "Handling req.body, req.params, and req.query." },
            { title: "Authentication", content: "Implementing JWT (JSON Web Tokens) for secure logins." },
            { title: "CORS", configuring: "Configuring Cross-Origin Resource Sharing for frontend communication." },
            { title: "Error Middleware", content: "Centralized error handling for the entire application." },
            { title: "MVC Pattern", content: "Organizing code into Models, Views, and Controllers." }
        ]
    },
    {
        title: "6. MongoDB (NoSQL Database)",
        lessons: [
            { title: "BSON Document Model", content: "Understanding how data is stored and nested." },
            { title: "CRUD Operations", content: "mastering find(), updateOne(), insertMany(), and delete()." },
            { title: "Mongoose Schemas", content: "Defining data structures and types with validation rules." },
            { title: "Data Relationships", content: "Choosing between Embedding (nested) vs. Referencing (linking)." },
            { title: "Aggregation Pipeline", content: "Using $match, $group, and $sort for complex data analysis." },
            { title: "Indexing", content: "Creating indexes to make database searches 10x faster." },
            { title: "Mongoose Hooks", content: "Using pre('save') for tasks like password hashing." }
        ]
    },
    {
        title: "7. Deployment & DevOps",
        lessons: [
            { title: "Git & GitHub Mastery", content: "Branching, merging, and version control best practices." },
            { title: "Vercel Deployment", content: "Deploying MERN stack applications with clean URLs and custom domains." },
            { title: "Environment Variables", content: "Securing your MongoDB URI and JWT secrets on the cloud." },
            { title: "CORS & Security", content: "Finalizing production security settings." }
        ]
    },
    {
        title: "8. Final Capstone Project",
        lessons: [
            { title: "Build Your Professional Fullstack Web App", content: "Integrate HTML, CSS, JavaScript, Node.js, Express, and MongoDB into one high-end application. Use the concepts from all previous modules to create a real-world product." },
            { title: "Final Project Submission", content: "SPECIAL_SUBMISSION_VIEW" }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        // Clear existing courses (optional, but good for a fresh start with the new schema)
        await Course.deleteMany({});

        const newCourse = new Course({
            title: "Full Stack MERN Internship Mastery",
            description: "A complete professional journey from HTML5 to advanced Node.js and MongoDB. Bridging the gap between theory and real-world experience.",
            modules: curriculum
        });

        await newCourse.save();
        console.log('Curriculum seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
}

seed();
