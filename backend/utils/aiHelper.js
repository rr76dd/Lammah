const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeFile = async (fileBuffer) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "قم بتحليل هذا الملف واستخراج أهم النقاط." },
                { role: "user", content: fileBuffer.toString('utf-8') }
            ]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return "Error analyzing the file";
    }
};
