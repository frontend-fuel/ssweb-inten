const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./server/models/Course');

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const course = await Course.findOne();
        
        let totalLessons = 0;
        let completeLessons = 0;
        let missing = [];

        course.modules.forEach(m => {
            m.lessons.forEach(l => {
                totalLessons++;
                if (l.content && l.content.length > 500 && l.content !== "SPECIAL_SUBMISSION_VIEW") {
                    completeLessons++;
                } else if (l.content === "SPECIAL_SUBMISSION_VIEW") {
                    // This is intentional
                    completeLessons++;
                } else {
                    missing.push(`${m.title} -> ${l.title}`);
                }
            });
        });

        console.log(`\n📊 CURRICULUM STATUS:`);
        console.log(`✅ Complete: ${completeLessons} / ${totalLessons}`);
        console.log(`❌ Missing: ${missing.length}`);
        
        if (missing.length > 0) {
            console.log('\nList of missing/failed lessons:');
            missing.forEach(m => console.log(` - ${m}`));
        } else {
            console.log('\n🔥 ALL LESSONS ARE 100% COMPLETE WITH BIG DATA!');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
