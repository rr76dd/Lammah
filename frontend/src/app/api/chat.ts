import { NextApiRequest, NextApiResponse } from "next";

// ✅ احصل على مفتاح API من `.env.local`
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
const SITE_NAME = process.env.SITE_NAME || "Lammah";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "qwen/qwen2.5-vl-72b-instruct:free";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: "❌ يجب توفير رسالة!" });
    }

    // ✅ بناء سجل المحادثة للسياق
    const messages = [
      { 
        role: "system", 
        content: "أنت لمّاح، مساعد دراسي ذكي يساعد الطلاب في فهم المواد الدراسية وتحسين مهاراتهم التعليمية. أجب بشكل مفيد ودقيق ومختصر باللغة العربية. قدم معلومات علمية صحيحة وموثوقة."
      },
    ];

    // إضافة سجل المحادثة السابق إذا كان موجوداً
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach(msg => {
        if (msg.sender === "أنت") {
          messages.push({ role: "user", content: msg.text });
        } else if (msg.sender === "Lammah") {
          messages.push({ role: "assistant", content: msg.text });
        }
      });
    }

    // إضافة الرسالة الحالية
    messages.push({ role: "user", content: message });

    // ✅ إرسال الطلب إلى OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.choices) || data.choices.length === 0 || !data.choices[0].message) {
        console.error("❌ خطأ في تنسيق رد API:", data);
        throw new Error("❌ فشل في تحليل استجابة API");
      }

    const aiResponse = data.choices[0].message?.content?.trim();

    if (!aiResponse) {
      throw new Error("❌ فشل في الحصول على رد من النموذج!");
    }

    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("❌ خطأ في المحادثة:", error);
    return res.status(500).json({ error: "❌ حدث خطأ أثناء معالجة المحادثة." });
  }
}