const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const explainTopic = async (topic, content) => {
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    let lastError = null;

    for (const model of models) {
        try {
            console.log(`[AI] Attempting synthesis with ${model}...`);
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a Senior Software Architect and Head of Curriculum at SS WebTech. 
                            Your goal is to transform basic topics into ADVANCED, HIGH-LEVEL industry standard lessons.
                            
                            RULES:
                            1. Use professional, technical language but stay accessible.
                            2. Focus on "Premium" concepts: Performance, Security, and Clean Code.
                            3. Format using beautiful HTML:
                               - Use <h2 class='premium-title'> for main headings.
                               - Use <div class='concept-card'> for key explanations.
                               - Use <pre class='code-block'><code>...</code></pre> for examples.
                               - Include a '💡 Pro Tip' section in every lesson.
                               - Include a '🚀 Mastery Challenge' at the end.
                            4. DO NOT use markdown. ONLY return clean HTML.`
                        },
                        {
                            role: 'user',
                            content: `Generate a full, advanced lesson for the topic: "${topic}". 
                            Reference these core points but expand them into a professional masterclass: "${content}".`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            const data = await response.json();
            
            if (response.ok && data.choices && data.choices[0]) {
                console.log(`[AI] Synthesis successful with ${model}`);
                return data.choices[0].message.content;
            } else {
                console.warn(`[AI] Model ${model} failed:`, data.error?.message || 'Unknown error');
                lastError = data.error?.message || 'Invalid response format';
                continue; // Try next model
            }
        } catch (error) {
            console.error(`[AI] Exception with ${model}:`, error.message);
            lastError = error.message;
            continue;
        }
    }

    throw new Error(`All AI models failed. Last error: ${lastError}`);
};

module.exports = { explainTopic };
