const supabase = require("../config/supabase");

// ✅ استرجاع جميع الفلاش كاردز مع دعم Pagination
exports.getFlashcards = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error } = await supabase
            .from("flashcards")
            .select("id, question, answer, created_at, user_id")
            .order("created_at", { ascending: false })
            .range(start, end);

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ flashcards: data });
    } catch (error) {
        res.status(500).json({ error: "❌ خطأ في استرجاع الفلاش كاردز: " + error.message });
    }
};

// ✅ استرجاع فلاش كارد معين عبر ID
exports.getFlashcardById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("flashcards")
            .select("id, question, answer, created_at, user_id")
            .eq("id", id)
            .single();

        if (error || !data) return res.status(404).json({ error: "❌ الفلاش كارد غير موجود" });

        res.status(200).json({ flashcard: data });
    } catch (error) {
        res.status(500).json({ error: "❌ خطأ في استرجاع الفلاش كارد: " + error.message });
    }
};

// ✅ إنشاء فلاش كارد جديد
exports.createFlashcard = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const userId = req.user.id;

        if (!question || !answer) {
            return res.status(400).json({ error: "❌ السؤال والإجابة مطلوبان" });
        }

        const { data, error } = await supabase
            .from("flashcards")
            .insert([{ question, answer, user_id: userId }]);

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ message: "✅ تم إنشاء الفلاش كارد بنجاح", flashcard: data });
    } catch (error) {
        res.status(500).json({ error: "❌ خطأ في إنشاء الفلاش كارد: " + error.message });
    }
};

// ✅ تحديث فلاش كارد معين
exports.updateFlashcard = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const userId = req.user.id;

        // التحقق من ملكية المستخدم
        const { data: existingCard, error: fetchError } = await supabase
            .from("flashcards")
            .select("user_id")
            .eq("id", id)
            .single();

        if (fetchError || !existingCard) {
            return res.status(404).json({ error: "❌ الفلاش كارد غير موجود" });
        }

        if (existingCard.user_id !== userId) {
            return res.status(403).json({ error: "❌ ليس لديك إذن لتعديل هذا الفلاش كارد" });
        }

        // تحديث الفلاش كارد
        const { data, error } = await supabase
            .from("flashcards")
            .update({ question, answer })
            .eq("id", id);

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: "✅ تم تحديث الفلاش كارد بنجاح", flashcard: data });
    } catch (error) {
        res.status(500).json({ error: "❌ خطأ في تحديث الفلاش كارد: " + error.message });
    }
};

// ✅ حذف فلاش كارد معين
exports.deleteFlashcard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // التحقق من ملكية المستخدم للفلاش كارد
        const { data: existingCard, error: fetchError } = await supabase
            .from("flashcards")
            .select("user_id")
            .eq("id", id)
            .single();

        if (fetchError || !existingCard) {
            return res.status(404).json({ error: "❌ الفلاش كارد غير موجود" });
        }

        if (existingCard.user_id !== userId) {
            return res.status(403).json({ error: "❌ ليس لديك إذن لحذف هذا الفلاش كارد" });
        }

        // حذف الفلاش كارد
        const { error } = await supabase
            .from("flashcards")
            .delete()
            .eq("id", id);

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: "✅ تم حذف الفلاش كارد بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "❌ خطأ في حذف الفلاش كارد: " + error.message });
    }
};
