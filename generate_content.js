const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./server/models/Course');

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const curriculumStructure = [
    {
        title: "1. HTML5 (Structure & Accessibility)",
        lessons: ["Semantic Layout", "Advanced Forms", "Client-Side Validation", "Web Storage API", "Audio & Video API", "Canvas API", "SEO Metadata"]
    },
    {
        title: "2. CSS3 (Design & Layout)",
        lessons: ["Flexbox Mastery", "CSS Grid", "CSS Variables", "Responsive Design", "Animations & Keyframes", "Box Model Mastery", "Pseudo-elements"]
    },
    {
        title: "3. JavaScript (Logic & Engine)",
        lessons: ["Closures & Lexical Scope", "Asynchronous JS", "The DOM Tree", "Event Loop", "ES6+ Features", "Array Methods", "Error Handling"]
    },
    {
        title: "4. Node.js (Server Environment)",
        lessons: ["Event-Driven Architecture", "File System (FS)", "NPM Ecosystem", "Environment Variables", "Streams & Buffers", "CommonJS vs. ES Modules", "HTTP Module"]
    },
    {
        title: "5. Express.js (Backend Framework)",
        lessons: ["Middleware Pattern", "RESTful Routing", "Request Parsing", "Authentication", "CORS", "Error Middleware", "MVC Pattern"]
    },
    {
        title: "6. MongoDB (NoSQL Database)",
        lessons: ["BSON Document Model", "CRUD Operations", "Mongoose Schemas", "Data Relationships", "Aggregation Pipeline", "Indexing", "Mongoose Hooks"]
    },
    {
        title: "7. Deployment & DevOps",
        lessons: ["Git & GitHub Mastery", "Vercel Deployment", "Environment Variables Setup", "CORS & Security Production"]
    }
];

async function generateLessonContent(moduleTitle, lessonTitle) {
    const prompt = `
Act as a Senior Lead Full Stack Developer and Educator at SS WebTech. 
Generate an extremely detailed, comprehensive, and professional learning module for the topic: "${lessonTitle}".
This lesson is part of the "${moduleTitle}" chapter.

Requirements:
1. **Introduction**: Explain why this specific topic is crucial for real-world enterprise development.
2. **Deep Dive**: Provide a deep-dive technical explanation (at least 500 words). Explain the "Under the hood" logic.
3. **Code Mastery**: Provide at least 2 high-quality, extensively commented code examples (HTML, CSS, JS, or Node/Mongo as applicable). Make the code modern (ES6+).
4. **The Experience Gap (Pro Tip)**: Share a "secret" industry insight, a common production bug, or a performance optimization related to this topic.
5. **Mastery Challenge**: Provide a practical, challenging task for the student to solve in their Code Playground.

Formatting: Use premium GitHub-flavored Markdown. Use bolding, bullet points, and clean tables for high readability.
`;

    let retries = 3;
    while (retries > 0) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.6,
                    max_tokens: 4096
                })
            });

            const data = await response.json();
            
            if (data.error && data.error.type === 'rate_limit_exceeded') {
                console.log(`    ⏳ Rate limit hit. Waiting 30 seconds...`);
                await new Promise(r => setTimeout(r, 30000));
                retries--;
                continue;
            }

            if (data.error) {
                console.error(`  ❌ Groq API Error for ${lessonTitle}:`, data.error.message);
                return null;
            }
            if (!data.choices || !data.choices[0]) {
                console.error(`  ❌ Unexpected API Response for ${lessonTitle}:`, JSON.stringify(data));
                return null;
            }
            return data.choices[0].message.content;
        } catch (err) {
            console.error(`  ❌ Connection Error for ${lessonTitle}:`, err.message);
            await new Promise(r => setTimeout(r, 10000));
            retries--;
        }
    }
    return null;
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB. Starting Massive Content Generation...');

        let course = await Course.findOne();
        if (!course) {
            course = new Course({
                title: "Full Stack MERN Masterclass - SS WebTech",
                description: "The most comprehensive professional journey from zero to Senior Developer.",
                modules: []
            });
        }

        // Initialize modules structure if empty
        if (course.modules.length === 0) {
            course.modules = curriculumStructure.map(m => ({
                title: m.title,
                lessons: m.lessons.map(l => ({ title: l, content: "Generating..." }))
            }));
            await course.save();
        }

        for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
            const module = course.modules[mIdx];
            console.log(`\n📦 Processing Module: ${module.title}`);

            for (let lIdx = 0; lIdx < module.lessons.length; lIdx++) {
                const lesson = module.lessons[lIdx];
                
                // Skip if already generated
                if (lesson.content && lesson.content !== "Generating..." && lesson.content.length > 500) {
                    console.log(`  ✅ Skipping ${lesson.title} (Already exists)`);
                    continue;
                }

                console.log(`  🚀 Generating content for: ${lesson.title}...`);
                const content = await generateLessonContent(module.title, lesson.title);

                if (content) {
                    // Refresh course object before saving to avoid version conflicts
                    const latestCourse = await Course.findById(course._id);
                    latestCourse.modules[mIdx].lessons[lIdx].content = content;
                    await latestCourse.save();
                    console.log(`  ✨ Saved ${lesson.title} (${content.length} characters)`);
                }

                // Increased delay to 10 seconds
                await new Promise(r => setTimeout(r, 10000));
            }
        }

        // Add the special Final Submission Module at the end
        if (!course.modules.find(m => m.title === "8. Final Capstone Project")) {
            course.modules.push({
                title: "8. Final Capstone Project",
                lessons: [
                    { title: "Build Your Professional Fullstack Web App", content: "Integrate everything you've learned into one high-end product." },
                    { title: "Final Project Submission", content: "SPECIAL_SUBMISSION_VIEW" }
                ]
            });
            await course.save();
        }

        console.log('\n✅ ALL CONTENT GENERATED SUCCESSFULLY!');
        process.exit();
    } catch (err) {
        console.error('Fatal Error:', err);
        process.exit(1);
    }
}

run();
