const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./server/models/Course');

dotenv.config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const course = await Course.findOne();
        
        // Find Module 8 (Final Capstone)
        const mod8 = course.modules.find(m => m.title.includes('8. Final') || m.title.includes('Capstone'));
        
        if (mod8) {
            // Find the submission lesson
            const subLesson = mod8.lessons.find(l => l.title.includes('Submission'));
            if (subLesson) {
                subLesson.content = 'SPECIAL_SUBMISSION_VIEW';
                await course.save();
                console.log('✅ Final Project Submission view restored!');
            }
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
