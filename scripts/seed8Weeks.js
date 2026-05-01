const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../server/models/Course');
const Module = require('../server/models/Module');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        await Course.deleteMany({});
        await Module.deleteMany({});

        const course = await Course.create({
            title: 'Full Stack Web Development - 8 Week Masterclass',
            description: 'A comprehensive 8-week journey from HTML/CSS basics to professional Full-Stack deployment.',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
        });

        const modules = [
            // Week 1: HTML & CSS3 Fundamentals
            { week: 1, order: 1, title: 'Module 1: Intro to Web Development', lessons: [{ title: 'What is Web Dev?', order: 1, content: 'Fundamentals of the web, clients, and servers.' }], quiz: [] },
            { week: 1, order: 2, title: 'Module 2: HTML Core', lessons: [{ title: 'HTML Tags & Structure', order: 1, content: 'Tags, attributes, lists, and tables.' }], quiz: [] },
            { week: 1, order: 3, title: 'Module 3: CSS Styling', lessons: [{ title: 'CSS Box Model', order: 1, content: 'Colors, typography, margin, and padding.' }], quiz: [] },
            { week: 1, order: 4, title: 'Module 4: Flexbox Layout', lessons: [{ title: 'Flexbox Guide', order: 1, content: 'How to align items easily.' }], 
              quiz: [
                { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Main Log", "None"], correctAnswer: 0 },
                { question: "Which property is used for Flexbox alignment along the main axis?", options: ["align-items", "justify-content", "flex-direction", "grid-gap"], correctAnswer: 1 },
                { question: "What is the default value of the position property?", options: ["relative", "absolute", "fixed", "static"], correctAnswer: 3 },
                { question: "Which HTML5 element is used to specify a footer for a document?", options: ["<bottom>", "<section>", "<footer>", "<div>"], correctAnswer: 2 },
                { question: "In CSS Box Model, which layer is between Padding and Margin?", options: ["Content", "Border", "Outline", "Space"], correctAnswer: 1 },
                { question: "Which CSS property controls the text size?", options: ["font-style", "text-size", "font-size", "text-style"], correctAnswer: 2 },
                { question: "How do you make a list that lists items with numbers?", options: ["<ul>", "<ol>", "<li>", "<dl>"], correctAnswer: 1 },
                { question: "What is the correct CSS for making all <p> elements bold?", options: ["p {font-weight:bold;}", "p {text-size:bold;}", "p {font:bold;}", "p {style:bold;}"], correctAnswer: 0 },
                { question: "Which HTML attribute is used to define inline styles?", options: ["font", "class", "styles", "style"], correctAnswer: 3 },
                { question: "Which property is used to change the left margin of an element?", options: ["padding-left", "margin-left", "indent", "spacing"], correctAnswer: 1 }
              ]
            },

            // Week 2: Advanced Layout & Design
            { week: 2, order: 1, title: 'Module 1: Advanced CSS', lessons: [{ title: 'CSS Grid Layout', order: 1, content: 'Creating complex 2D layouts.' }], quiz: [] },
            { week: 2, order: 2, title: 'Module 2: Responsive Design', lessons: [{ title: 'Media Queries', order: 1, content: 'Making websites look good on mobile.' }], quiz: [] },
            { week: 2, order: 3, title: 'Module 3: Animations', lessons: [{ title: 'Transitions & Keyframes', order: 1, content: 'Animating elements with CSS.' }], 
              quiz: [
                { question: "Which property is used to define a CSS Grid container?", options: ["display: flex", "display: grid", "grid-template", "layout: grid"], correctAnswer: 1 },
                { question: "What does '1fr' represent in CSS Grid?", options: ["1 Fixed Row", "1 Fraction of available space", "1 Full Range", "1 Frame"], correctAnswer: 1 },
                { question: "Which @rule is used to apply styles based on screen width?", options: ["@import", "@keyframes", "@media", "@screen"], correctAnswer: 2 },
                { question: "What is the Mobile-First design philosophy?", options: ["Code mobile first, then desktop", "Buy a phone", "Desktop first", "None"], correctAnswer: 0 },
                { question: "Which property allows you to change an element from one style to another over time?", options: ["animation", "transformation", "transition", "morph"], correctAnswer: 2 },
                { question: "Which unit is relative to the width of the viewport?", options: ["px", "em", "vw", "rem"], correctAnswer: 2 },
                { question: "What does z-index: -1 do?", options: ["Hides element", "Moves element behind parent", "Makes it transparent", "None"], correctAnswer: 1 },
                { question: "Which grid property is used to specify the gap between rows and columns?", options: ["grid-gap", "spacing", "margin", "padding"], correctAnswer: 0 },
                { question: "What is the correct syntax for a media query?", options: ["@media (max-width: 600px)", "@media screen and 600px", "@query (600px)", "None"], correctAnswer: 0 },
                { question: "How do you stop an animation after it finishes?", options: ["animation-stop", "animation-fill-mode: forwards", "stop: true", "None"], correctAnswer: 1 }
              ]
            },

            // Week 3: Core JavaScript
            { week: 3, order: 1, title: 'Module 1: JavaScript Basics', lessons: [{ title: 'Variables & Logic', order: 1, content: 'Let, const, and if/else logic.' }], quiz: [] },
            { week: 3, order: 2, title: 'Module 2: Loops & Functions', lessons: [{ title: 'Control Flow', order: 1, content: 'For loops, while loops, and functions.' }], quiz: [] },
            { week: 3, order: 3, title: 'Module 3: DOM Manipulation', lessons: [{ title: 'Changing HTML with JS', order: 1, content: 'Events and DOM API.' }], 
              quiz: [
                { question: "Which keyword defines a block-scoped variable that can be changed?", options: ["const", "var", "let", "static"], correctAnswer: 2 },
                { question: "What is the result of 3 === '3'?", options: ["true", "false", "undefined", "NaN"], correctAnswer: 1 },
                { question: "How do you write 'Hello World' in an alert box?", options: ["msg('Hello')", "alert('Hello World')", "print('Hello')", "None"], correctAnswer: 1 },
                { question: "Which function is used to parse a string into an integer?", options: ["parseInt()", "toInteger()", "Number()", "int()"], correctAnswer: 0 },
                { question: "How do you create a function in JavaScript?", options: ["function = myFunc()", "function:myFunc()", "function myFunc()", "new function()"], correctAnswer: 2 },
                { question: "Which loop runs at least once even if the condition is false?", options: ["for", "while", "do...while", "foreach"], correctAnswer: 2 },
                { question: "How do you select an element with class 'btn' using querySelector?", options: ["query('#btn')", "query('.btn')", "querySelector('.btn')", "None"], correctAnswer: 2 },
                { question: "Which event occurs when the user clicks on an HTML element?", options: ["onmouseclick", "onchange", "onclick", "onmouseover"], correctAnswer: 2 },
                { question: "What is the correct way to add an element to an array?", options: ["arr.add()", "arr.push()", "arr.insert()", "arr.put()"], correctAnswer: 1 },
                { question: "How do you write an IF statement in JavaScript?", options: ["if i = 5", "if (i == 5)", "if i == 5 then", "if i = 5 then"], correctAnswer: 1 }
              ]
            },

            // Week 4: Advanced JS & Asynchrony
            { week: 4, order: 1, title: 'Module 1: Advanced JS', lessons: [{ title: 'ES6+ Features', order: 1, content: 'Arrow functions, Template literals.' }], quiz: [] },
            { week: 4, order: 2, title: 'Module 2: Async JavaScript', lessons: [{ title: 'Promises & Async/Await', order: 1, content: 'Handling asynchronous operations.' }], 
              quiz: [
                { question: "What is an Arrow Function?", options: ["(x) => x * x", "function(x) {return x}", "x -> x", "None"], correctAnswer: 0 },
                { question: "What does the Spread Operator (...) do?", options: ["Multiplies values", "Expands an array into elements", "Deletes array", "None"], correctAnswer: 1 },
                { question: "What is a Promise in JS?", options: ["A guarantee", "An object representing future completion of async op", "A callback", "None"], correctAnswer: 1 },
                { question: "What keyword is used inside an async function to wait for a promise?", options: ["wait", "stop", "await", "hold"], correctAnswer: 2 },
                { question: "What is Template Literal syntax?", options: ["'Hello ${name}'", "\"Hello ${name}\"", "`Hello ${name}`", "None"], correctAnswer: 2 },
                { question: "What is the purpose of Destructuring?", options: ["Destroying variables", "Extracting values from arrays/objects into variables", "Minifying", "None"], correctAnswer: 1 },
                { question: "What does JSON.stringify() do?", options: ["Parses JSON string", "Converts JS object to JSON string", "None", "Loads JSON"], correctAnswer: 1 },
                { question: "Which array method returns a new array with elements that pass a test?", options: ["map()", "filter()", "reduce()", "forEach()"], correctAnswer: 1 },
                { question: "What is the 'this' keyword in an arrow function?", options: ["Inherited from parent scope", "Points to window", "Points to function", "None"], correctAnswer: 0 },
                { question: "What is a closure in JavaScript?", options: ["Function closing a loop", "Function bundled with its lexical environment", "An error", "None"], correctAnswer: 1 }
              ]
            },

            // Week 5: Backend with Node & Express
            { week: 5, order: 1, title: 'Module 1: Node.js Core', lessons: [{ title: 'Node Runtime', order: 1, content: 'Modules and File System.' }], quiz: [] },
            { week: 5, order: 2, title: 'Module 2: Express Framework', lessons: [{ title: 'Creating Servers', order: 1, content: 'Routing and Middleware.' }], 
              quiz: [
                { question: "What is Node.js?", options: ["Programming Language", "JS Runtime built on Chrome V8", "Database", "Library"], correctAnswer: 1 },
                { question: "How do you import a module in Node (CommonJS)?", options: ["import", "fetch", "require", "get"], correctAnswer: 2 },
                { question: "What does the 'fs' module handle?", options: ["Front-end Styles", "File System", "Fast Sync", "None"], correctAnswer: 1 },
                { question: "What command installs a package and saves it to dependencies?", options: ["npm add", "npm save", "npm install <name>", "None"], correctAnswer: 2 },
                { question: "What is Express.js?", options: ["Database", "Web Framework for Node.js", "Frontend library", "Compiler"], correctAnswer: 1 },
                { question: "What is Middleware in Express?", options: ["A database", "Functions that have access to req and res objects", "A routing tool", "None"], correctAnswer: 1 },
                { question: "What does res.send() do?", options: ["Sends an email", "Sends the HTTP response", "Redirects", "None"], correctAnswer: 1 },
                { question: "Which HTTP method is used to CREATE data?", options: ["GET", "POST", "PUT", "DELETE"], correctAnswer: 1 },
                { question: "What is 'package.json' used for?", options: ["Styles", "Project metadata and dependencies", "HTML", "None"], correctAnswer: 1 },
                { question: "How do you access URL parameters in Express?", options: ["req.params", "req.query", "req.body", "None"], correctAnswer: 0 }
              ]
            },

            // Week 6: Databases with MongoDB
            { week: 6, order: 1, title: 'Module 1: NoSQL Databases', lessons: [{ title: 'MongoDB Intro', order: 1, content: 'Collections and Documents.' }], quiz: [] },
            { week: 6, order: 2, title: 'Module 2: Mongoose ODM', lessons: [{ title: 'Schemas & Models', order: 1, content: 'Modeling data in JS.' }], 
              quiz: [
                { question: "What type of database is MongoDB?", options: ["Relational (SQL)", "Document-oriented (NoSQL)", "Graph", "None"], correctAnswer: 1 },
                { question: "What is Mongoose?", options: ["A programming language", "ODM (Object Data Modeling) library for MongoDB", "Database", "None"], correctAnswer: 1 },
                { question: "What is a 'Schema' in Mongoose?", options: ["A styling tool", "Definition of the document structure", "A loop", "None"], correctAnswer: 1 },
                { question: "Which method is used to save a document to the database?", options: ["save()", "push()", "insert()", "put()"], correctAnswer: 0 },
                { question: "What is the default unique identifier in MongoDB documents?", options: ["id", "uid", "_id", "key"], correctAnswer: 2 },
                { question: "How do you find multiple documents in Mongoose?", options: ["Model.find()", "Model.get()", "Model.all()", "None"], correctAnswer: 0 },
                { question: "What does 'populate()' do in Mongoose?", options: ["Fills an array", "Replaces IDs with actual documents from other collections", "None", "Adds data"], correctAnswer: 1 },
                { question: "What is a 'collection' in MongoDB?", options: ["A row", "A group of documents", "A table in SQL", "None"], correctAnswer: 1 },
                { question: "What is the purpose of findByIdAndUpdate()?", options: ["Deletes doc", "Finds one doc and updates it", "Creates doc", "None"], correctAnswer: 1 },
                { question: "What is Atlas in MongoDB?", options: ["A map", "Cloud-hosted MongoDB service", "A library", "None"], correctAnswer: 1 }
              ]
            },

            // Week 7: Security & Auth
            { week: 7, order: 1, title: 'Module 1: Authentication', lessons: [{ title: 'JWT & Security', order: 1, content: 'Protecting routes with tokens.' }], quiz: [] },
            { week: 7, order: 2, title: 'Module 2: Bcrypt', lessons: [{ title: 'Password Hashing', order: 1, content: 'Securing user data.' }], 
              quiz: [
                { question: "What does JWT stand for?", options: ["Java Web Token", "JSON Web Token", "Joint Web Token", "None"], correctAnswer: 1 },
                { question: "What are the three parts of a JWT?", options: ["Header, Payload, Signature", "Key, Value, ID", "Name, Email, Pass", "None"], correctAnswer: 0 },
                { question: "What does Bcrypt do?", options: ["Encrypts text", "Hashes passwords with a salt", "None", "Sends tokens"], correctAnswer: 1 },
                { question: "What is a 'Salt' in cryptography?", options: ["Table salt", "Random data added to hashing process", "A key", "None"], correctAnswer: 1 },
                { question: "Which HTTP status code represents 'Unauthorized'?", options: ["200", "401", "404", "500"], correctAnswer: 1 },
                { question: "What is the purpose of a refresh token?", options: ["Logs out user", "Obtains new access token after expiry", "None", "Deletes session"], correctAnswer: 1 },
                { question: "Where should you NOT store sensitive tokens?", options: ["HttpOnly Cookies", "LocalStorage", "Plain text file", "None"], correctAnswer: 1 },
                { question: "What is CORS?", options: ["Cross-Origin Resource Sharing", "Core Object Resource System", "None", "Code Run System"], correctAnswer: 0 },
                { question: "What does bcrypt.compare() do?", options: ["Encrypts pass", "Checks if plain text pass matches hashed pass", "None", "Deletes pass"], correctAnswer: 1 },
                { question: "What is an Environment Variable?", options: ["A variable in JS", "Variable used to store secrets like API keys outside code", "None", "A loop"], correctAnswer: 1 }
              ]
            },

            // Week 8: Project & Deployment
            { week: 8, order: 1, title: 'Module 1: Deployment', lessons: [{ title: 'Going Live', order: 1, content: 'Hosting on Render/Vercel.' }], quiz: [] },
            { week: 8, order: 2, title: 'Module 2: Final Project', lessons: [{ 
                title: 'Capstone Project', 
                order: 1, 
                content: 'Building a full stack app.',
                aiGeneratedContent: `### 🏆 Final Capstone Project\nCongratulations on reaching the final week of the SS WebTech Masterclass!\n\nYour final challenge is to build a **Full-Stack MERN Application**...\n\n(Manual submission to admin for certification)`
            }], 
              quiz: []
            },
            { week: 8, order: 3, title: 'Module 3: Project Submission', lessons: [{ 
                title: 'Submit Final Project', 
                order: 1, 
                content: 'Form to submit drive link',
                aiGeneratedContent: 'SPECIAL_SUBMISSION_VIEW'
            }], 
              quiz: []
            }
        ];

        for (const m of modules) {
            await Module.create({ ...m, courseId: course._id });
        }

        console.log('Seeded 8-Week Masterclass with AI-Authored 10-Question Weekly Quizzes Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
