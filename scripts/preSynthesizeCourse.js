const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Module = require('../server/models/Module');
const { explainTopic } = require('../server/services/aiService');

dotenv.config();

const preSynthesize = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🚀 Starting Bulk AI Pre-Synthesis...');

        const modules = await Module.find({});
        let totalSynthesized = 0;

        for (const module of modules) {
            console.log(`\n📦 Processing Week ${module.week}: ${module.title}`);
            
            for (let i = 0; i < module.lessons.length; i++) {
                const lesson = module.lessons[i];
                
                if (lesson.aiGeneratedContent) {
                    console.log(`   ✅ Skipping "${lesson.title}" (Already Synthesized)`);
                    continue;
                }

                console.log(`   🧠 Synthesizing "${lesson.title}"...`);
                try {
                    const explanation = await explainTopic(lesson.title, lesson.content);
                    
                    // Update specific lesson in the array
                    await Module.updateOne(
                        { _id: module._id, "lessons._id": lesson._id },
                        { $set: { "lessons.$.aiGeneratedContent": explanation } }
                    );
                    
                    console.log(`      ✨ Success!`);
                    totalSynthesized++;
                } catch (err) {
                    console.error(`      ❌ Failed "${lesson.title}":`, err.message);
                }
            }
        }

        console.log(`\n🎉 Pre-Synthesis Complete! Total new lessons architected: ${totalSynthesized}`);
        console.log('All content is now stored PERMANENTLY in your database. You can now serve the course without live AI calls.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

preSynthesize();
