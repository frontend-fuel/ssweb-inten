const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./server/models/Student');

dotenv.config();

async function reset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const result = await Student.findOneAndUpdate(
            { email: 'a@gmail.com' },
            { 
                completedModules: [], 
                completedLessons: [],
                quizScores: []
            },
            { new: true }
        );

        if (result) {
            console.log(`✅ Progress reset for ${result.email}`);
            console.log('Modules: 0, Lessons: 0');
        } else {
            console.log('❌ Student a@gmail.com not found.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reset();
