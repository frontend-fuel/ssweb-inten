const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../server/models/Student');
const Module = require('../server/models/Module');

dotenv.config();

const fixProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- PROGRESS FIXER ---');
        
        const students = await Student.find({});
        const modules = await Module.find({});
        
        for (const s of students) {
            console.log(`Checking student: ${s.name}`);
            const completedLessons = s.completedLessons.map(id => id.toString());
            
            for (const m of modules) {
                // If module has no quiz
                if (!m.quiz || m.quiz.length === 0) {
                    const missing = m.lessons.filter(l => !completedLessons.includes(l._id.toString()));
                    
                    if (missing.length === 0 && m.lessons.length > 0) {
                        console.log(`- Auto-completing module: ${m.title}`);
                        if (!s.completedModules.includes(m._id)) {
                            s.completedModules.push(m._id);
                        }
                    } else if (m.lessons.length > 0) {
                        console.log(`- Module ${m.title} still missing ${missing.length} lessons: ${missing.map(l => l.title).join(', ')}`);
                    }
                }
            }
            await s.save();
        }
        
        console.log('\nProgress Fix Complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixProgress();
