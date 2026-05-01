const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Module = require('../server/models/Module');

dotenv.config();

const patchWeek8 = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Patching Week 8...');

        // 1. Remove Quiz from Week 8 Module 2
        // 2. Set static content for Final Project lesson
        const projectContent = `
### 🏆 Final Capstone Project
Congratulations on reaching the final week of the SS WebTech Masterclass! 

Your final challenge is to build a **Full-Stack MERN Application** that demonstrates everything you've learned over the last 8 weeks.

#### 🛠️ Project Requirements:
1. **Frontend**: A responsive React/HTML interface.
2. **Backend**: A Node.js & Express server.
3. **Database**: MongoDB integration for data persistence.
4. **Security**: User authentication (JWT) and protected routes.
5. **Deployment**: Hosted live on Vercel or Render.

#### 🚀 Submission Process:
Once your project is live, please send your **GitHub Repository URL** and the **Live Demo URL** to the admin for review. Upon successful evaluation, your official **Mastery Certificate** will be issued to your student portal.

Good luck, Developer!
        `.trim();

        const result = await Module.findOneAndUpdate(
            { week: 8, order: 2 },
            { 
                $set: { 
                    quiz: [],
                    "lessons.0.aiGeneratedContent": projectContent,
                    "lessons.0.content": "Manual Capstone Project Submission Guide"
                } 
            },
            { new: true }
        );

        if (result) {
            console.log('✅ Week 8 Module 2 updated: Quiz removed, Static content set.');
        } else {
            console.log('❌ Week 8 Module 2 not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

patchWeek8();
