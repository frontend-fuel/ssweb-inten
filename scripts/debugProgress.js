const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../server/models/Student');
const Module = require('../server/models/Module');

dotenv.config();

const debugProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- PROGRESS DEBUG ---');
        
        const students = await Student.find({});
        console.log(`Found ${students.length} students.`);
        
        for (const s of students) {
            console.log(`\nStudent: ${s.name} (${s.email})`);
            console.log(`- Completed Lessons: ${s.completedLessons.length}`);
            console.log(`- Completed Modules: ${s.completedModules.length}`);
        }
        
        const totalLessons = await Module.aggregate([
            { $unwind: "$lessons" },
            { $count: "total" }
        ]);
        console.log(`\nTotal Course Lessons: ${totalLessons[0]?.total || 0}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugProgress();
