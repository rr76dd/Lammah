const supabase = require("../supabaseClient");

// 📌 دالة لتحليل الملفات وإنشاء فلاش كاردز تلقائيًا
async function generateFlashcards(req, res) {
    try {
        const { fileId } = req.body;

        // 1️⃣ ✅ استرجاع بيانات الملف
        const { data: fileData, error: fileError } = await supabase
            .from("uploaded_files")
            .select("*")
            .eq("id", fileId)
            .single();

        console.log("🔍 File Query Result:", fileData, "Error:", fileError);

        if (fileError || !fileData) {
            console.error("🚨 File not found in Supabase:", fileError);
            return res.status(400).json({ error: "File not found!" });
        }

        console.log("📄 Processing file:", fileData.file_name);

        // 2️⃣ 🔥 محاكاة استخراج الفلاش كاردز من الملف
        const extractedFlashcards = [
            { question: "ما هو مفهوم الذكاء الاصطناعي؟", answer: "هو فرع من علوم الكمبيوتر يهتم بتطوير الأنظمة القادرة على محاكاة الذكاء البشري." },
            { question: "ما هي لغة البرمجة الأكثر استخدامًا في تطوير الذكاء الاصطناعي؟", answer: "بايثون (Python) هي الأكثر شيوعًا بسبب مكتباتها القوية مثل TensorFlow و PyTorch." }
        ];

        console.log("✅ Flashcards extracted:", extractedFlashcards);

        // 3️⃣ ✅ تجهيز البيانات قبل الإدراج
        const flashcardsToInsert = extractedFlashcards.map(card => ({
            file_id: fileId,
            user_id: fileData.user_id,
            question: card.question,
            answer: card.answer
        }));

        console.log("📥 Flashcards to insert:", JSON.stringify(flashcardsToInsert, null, 2));

        // 4️⃣ ✅ حفظ الفلاش كاردز في قاعدة البيانات
        const { data, error } = await supabase
            .from("flashcards")
            .insert(flashcardsToInsert)
            .select();

        console.log("🔥 Supabase Insert Response:", JSON.stringify(data, null, 2));
        console.log("🔥 Supabase Insert Error:", JSON.stringify(error, null, 2));

        if (error || !data || data.length === 0) {
            console.error("🔥 Supabase Insert Error:", error);
            return res.status(500).json({ error: "Failed to insert flashcards into database!" });
        }

        console.log("✅ Flashcards saved successfully:", data);
        res.json({ message: "Flashcards generated successfully!", flashcards: data });

    } catch (err) {
        console.error("🚨 Unexpected error:", err);
        res.status(500).json({ error: "An unexpected error occurred!" });
    }
}

// 📌 استرجاع الفلاش كاردز الخاصة بملف معين
async function getFlashcardsByFile(req, res) {
    try {
        const { fileId } = req.params;

        const { data, error } = await supabase
            .from("flashcards")
            .select("*")
            .eq("file_id", fileId);

        if (error) {
            console.error("🔥 Supabase Error:", error);
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No flashcards found for this file." });
        }

        console.log("✅ Flashcards retrieved:", data);
        res.json({ flashcards: data });

    } catch (err) {
        console.error("🚨 Unexpected error:", err);
        res.status(500).json({ error: "An unexpected error occurred!" });
    }
}

// 📌 استرجاع جميع الفلاش كاردز الخاصة بمستخدم معين
async function getFlashcardsByUser(req, res) {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from("flashcards")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("🔥 Supabase Error:", error);
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No flashcards found for this user." });
        }

        console.log("✅ Flashcards retrieved for user:", data);
        res.json({ flashcards: data });

    } catch (err) {
        console.error("🚨 Unexpected error:", err);
        res.status(500).json({ error: "An unexpected error occurred!" });
    }
}

module.exports = { generateFlashcards, getFlashcardsByFile, getFlashcardsByUser };
