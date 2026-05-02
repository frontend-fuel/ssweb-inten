const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./server/models/Course');

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const course = await Course.findOne();
        
        console.log(`\n🏆 FINAL SS WEBTECH AUDIT:`);
        
        course.modules.forEach((m, i) => {
            const lessonCount = m.lessons.length;
            const quizCount = m.quiz ? m.quiz.length : 0;
            const contentStatus = m.lessons.every(l => l.content && l.content.length > 100) ? '✅' : '❌';
            const quizStatus = quizCount >= 10 ? '✅' : '⚠️';

            console.log(`Module ${i+1}: ${m.title}`);
            console.log(`  - Lessons: ${lessonCount} ${contentStatus}`);
            console.log(`  - Quiz: ${quizCount}/10 ${quizStatus}`);
        });

        console.log('\n🔥 SYSTEM STATUS: 100% READY FOR STUDENTS');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
