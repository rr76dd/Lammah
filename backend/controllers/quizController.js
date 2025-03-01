const supabase = require("../supabaseClient");

// 📌 دالة لإنشاء اختبار جديد بناءً على الفلاش كاردز
async function generateQuiz(req, res) {
    try {
        const { fileId, userId, title } = req.body;

        // ✅ التحقق من صحة الإدخال
        if (!fileId || !userId) {
            return res.status(400).json({ error: "Missing required fields: fileId, userId" });
        }

        // 🔍 استرجاع الفلاش كاردز المرتبطة بهذا الملف
        const { data: flashcards, error: flashcardsError } = await supabase
            .from("flashcards")
            .select("*")
            .eq("file_id", fileId);

        if (flashcardsError) {
            console.error("🚨 Supabase Error fetching flashcards:", flashcardsError);
            return res.status(500).json({ error: "Failed to fetch flashcards!" });
        }

        if (!flashcards || flashcards.length === 0) {
            return res.status(404).json({ error: "No flashcards available for this file!" });
        }

        console.log("✅ Flashcards retrieved:", flashcards.length);

        // ✅ إنشاء الاختبار في قاعدة البيانات
        const quizTitle = title || `Quiz for file ${fileId}`;
        const { data: quiz, error: quizError } = await supabase
            .from("quizzes")
            .insert([{ 
                file_id: fileId, 
                user_id: userId, 
                title: quizTitle  
            }])
            .select()
            .single();

        if (quizError) {
            console.error("🔥 Error creating quiz:", quizError);
            return res.status(500).json({ error: quizError.message });
        }

        console.log("✅ Quiz created:", quiz);

        // 🔥 تحويل الفلاش كاردز إلى أسئلة اختبار اختيار من متعدد
        const quizQuestions = flashcards.map(card => ({
            quiz_id: quiz.id,
            question: card.question,
            option_a: card.answer,
            option_b: "إجابة خاطئة 1",
            option_c: "إجابة خاطئة 2",
            option_d: "إجابة خاطئة 3",
            correct_answer: card.answer
        }));

        console.log("📥 Preparing quiz questions:", JSON.stringify(quizQuestions, null, 2));

        // ✅ حفظ الأسئلة في Supabase
        const { data: questions, error: questionsError } = await supabase
            .from("quiz_questions")
            .insert(quizQuestions)
            .select();

        if (questionsError) {
            console.error("🔥 Error inserting questions:", questionsError);
            return res.status(500).json({ error: questionsError.message });
        }

        console.log("✅ Quiz questions saved successfully. Total:", questions.length);
        res.json({ message: "Quiz generated successfully!", quiz, questions });

    } catch (err) {
        console.error("🚨 Unexpected error:", err);
        res.status(500).json({ error: "An unexpected error occurred!" });
    }
}

// 📌 دالة لاسترجاع اختبار معين مع أسئلته
async function getQuiz(req, res) {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(400).json({ error: "Quiz ID is required!" });
        }

        // ✅ جلب بيانات الاختبار
        const { data: quiz, error: quizError } = await supabase
            .from("quizzes")
            .select("*")
            .eq("id", quizId)
            .single();

        if (quizError || !quiz) {
            return res.status(404).json({ error: "Quiz not found!" });
        }

        // ✅ جلب الأسئلة المرتبطة بالاختبار
        const { data: questions, error: questionsError } = await supabase
            .from("quiz_questions")
            .select("*")
            .eq("quiz_id", quizId);

        if (questionsError) {
            return res.status(500).json({ error: "Error fetching quiz questions!" });
        }

        console.log("✅ Retrieved quiz with questions:", questions.length);
        res.json({ quiz, questions });

    } catch (err) {
        console.error("🚨 Unexpected error:", err);
        res.status(500).json({ error: "An unexpected error occurred!" });
    }
}

// ✅ تصدير الدوال
module.exports = { generateQuiz, getQuiz };
