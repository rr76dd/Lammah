import { NextApiRequest, NextApiResponse } from "next";

// ✅ احصل على مفتاح API من `.env.local`
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://your-website.com";
const SITE_NAME = process.env.SITE_NAME || "Lammah";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "qwen/qwen2.5-vl-72b-instruct:free";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "❌ يجب توفير محتوى الملف!" });
    }

    // ✅ الخطوة 1: توليد عنوان ذكي للاختبار
    const titleResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL, // للمساعدة في ترتيب الموقع
        "X-Title": SITE_NAME,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "قم بتحليل المحتوى التالي واستخرج عنوانًا مناسبًا لاختبار حوله." },
          { role: "user", content },
        ],
        max_tokens: 50,
      }),
    });

    const titleData = await titleResponse.json();
    const generatedTitle = titleData.choices?.[0]?.message?.content?.trim() || "اختبار عام";

    // ✅ الخطوة 2: توليد 20 سؤال اختيار من متعدد
    const quizResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "قم بإنشاء 20 سؤال اختيار من متعدد بناءً على هذا المحتوى، مع 4 خيارات لكل سؤال وإجابة صحيحة." },
          { role: "user", content },
        ],
        max_tokens: 1000,
      }),
    });

    const quizData = await quizResponse.json();
    const quizText = quizData.choices?.[0]?.message?.content?.trim();
    if (!quizText) throw new Error("❌ فشل في توليد الأسئلة!");

    // ✅ تحليل الأسئلة وتحويلها إلى JSON
    const questions = parseQuizData(quizText);

    return res.status(200).json({ title: generatedTitle, quiz: { questions } });
  } catch (error) {
    console.error("❌ خطأ في توليد الاختبار:", error);
    return res.status(500).json({ error: "❌ حدث خطأ أثناء توليد الاختبار." });
  }
}

// ✅ دالة تحليل الأسئلة إلى JSON
function parseQuizData(rawText: string) {
  const questions: { text: string; choices: string[]; correctAnswer: string }[] = [];
  const lines = rawText.split("\n").filter(line => line.trim() !== "");

  let currentQuestion: { text: string; choices: string[]; correctAnswer: string } | null = null;

  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      // 🟢 بداية سؤال جديد
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = { text: line.replace(/^\d+\.\s*/, ""), choices: [], correctAnswer: "" };
    } else if (line.startsWith("-")) {
      // 🔹 خيار من الخيارات
      if (currentQuestion) {
        const choice = line.replace("- ", "").trim();
        currentQuestion.choices.push(choice);
      }
    } else if (line.startsWith("✅")) {
      // 🟢 تحديد الإجابة الصحيحة
      if (currentQuestion) {
        currentQuestion.correctAnswer = line.replace("✅ ", "").trim();
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}
