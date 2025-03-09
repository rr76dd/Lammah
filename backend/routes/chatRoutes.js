const express = require("express");
require("dotenv").config();

const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "qwen/qwen2.5-vl-72b-instruct:free"; // تأكد من صحة اسم النموذج

router.post("/", async (req, res) => {
    try {
        const { message, chatHistory } = req.body;
        if (!message) {
            return res.status(400).json({ error: "❌ يجب توفير رسالة!" });
        }

        const messages = [
            { role: "system", content: "أنت لماح مساعد ذكي يساعد الطلاب في الفهم وتحسين مهاراتهم التعليمية. أجب بوضوح واحترافية." },
        ];

        if (chatHistory && Array.isArray(chatHistory)) {
            chatHistory.forEach(msg => {
                messages.push({ role: msg.sender === "أنت" ? "user" : "assistant", content: msg.text });
            });
        }

        messages.push({ role: "user", content: message });

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                max_tokens: 1000,
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenRouter API Error:", { status: response.status, error: errorData });
            return res.status(500).json({ error: `❌ فشل في الاتصال بـ OpenRouter: ${response.statusText}` });
        }

        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error("❌ خطأ في استجابة OpenRouter API:", data);
            return res.status(500).json({ error: "❌ لم يتمكن الذكاء الاصطناعي من الرد!" });
        }

        const aiResponse = data.choices[0].message?.content?.trim() || "❌ لم يتمكن الذكاء الاصطناعي من توليد رد.";

        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error("❌ خطأ غير متوقع أثناء الاتصال بـ OpenRouter:", error);
        return res.status(500).json({ error: "❌ حدث خطأ داخلي أثناء معالجة الطلب." });
    }
});

module.exports = router;
