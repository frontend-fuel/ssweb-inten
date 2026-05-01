const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Module = require('../server/models/Module');
const Course = require('../server/models/Course');

dotenv.config();

const addSubmissionModule = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Adding Project Submission Module...');

        const course = await Course.findOne();
        if (!course) {
            console.log('❌ Course not found.');
            process.exit(1);
        }

        // Add Module 3 to Week 8
        const submissionModule = await Module.create({
            courseId: course._id,
            week: 8,
            order: 3,
            title: 'Module 3: Project Submission',
            lessons: [{
                title: 'Submit Final Project',
                order: 1,
                content: 'Form to submit drive link',
                aiGeneratedContent: 'SPECIAL_SUBMISSION_VIEW' // Marker for frontend
            }],
            quiz: []
        });

        console.log('✅ Project Submission Module added to Week 8.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addSubmissionModule();
