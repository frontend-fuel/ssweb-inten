const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./server/models/Course');

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function generateQuiz(moduleTitle, lessons) {
    const prompt = `
Act as a Technical Interviewer for SS WebTech. 
Generate a professional certification quiz for the module: "${moduleTitle}".
This module includes the following lessons: ${lessons.map(l => l.title).join(', ')}.

Requirements:
1. Generate exactly 10 Multiple Choice Questions (MCQs).
2. Focus on technical understanding, edge cases, and real-world application.
3. For each question, provide exactly 4 options.
4. Format: Return ONLY a valid JSON array of objects. No other text.
   Structure:
   [
     {
       "question": "The question text",
       "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
       "correctAnswer": 0
     }
   ]
`;

    let retries = 3;
    while (retries > 0) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.5,
                    max_tokens: 4096
                })
            });

            const data = await response.json();
            
            if (data.error && data.error.type === 'rate_limit_exceeded') {
                console.log(`    ⏳ Rate limit hit. Waiting 30 seconds...`);
                await new Promise(r => setTimeout(r, 30000));
                retries--;
                continue;
            }

            if (data.error) {
                console.error(`  ❌ API Error: ${data.error.message}`);
                return null;
            }
            
            let content = data.choices[0].message.content;
            
            const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }

            const parsed = JSON.parse(content);
            return Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);
        } catch (err) {
            console.error(`  ❌ Attempt failed for ${moduleTitle}:`, err.message);
            await new Promise(r => setTimeout(r, 10000));
            retries--;
        }
    }
    return null;
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB. Starting AI Quiz Generation...');

        const course = await Course.findOne();
        if (!course) {
            console.error('Course not found!');
            process.exit(1);
        }

        for (let i = 0; i < 7; i++) { // First 7 modules
            const module = course.modules[i];

            // Skip if already has quiz
            if (module.quiz && module.quiz.length >= 10) {
                console.log(`  ✅ Skipping ${module.title} (Quiz already exists)`);
                continue;
            }

            console.log(`\n📝 Generating 10 questions for Module ${i + 1}: ${module.title}...`);

            const quiz = await generateQuiz(module.title, module.lessons);

            if (quiz && quiz.length >= 10) {
                // Ensure exactly 10
                course.modules[i].quiz = quiz.slice(0, 10);
                await course.save();
                console.log(`  ✅ Saved 10 questions for ${module.title}`);
            } else {
                console.log(`  ❌ Failed to generate valid quiz for ${module.title}`);
            }

            // Delay for rate limits
            await new Promise(r => setTimeout(r, 10000));
        }

        console.log('\n🚀 ALL QUIZZES GENERATED SUCCESSFULLY!');
        process.exit();
    } catch (err) {
        console.error('Fatal Error:', err);
        process.exit(1);
    }
}

run();
