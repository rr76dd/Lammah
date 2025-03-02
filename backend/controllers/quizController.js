const supabase = require("../config/supabase");

// ✅ استرجاع جميع الاختبارات مع دعم Pagination
exports.getQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title, difficulty, created_at, user_id")
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ quizzes: data });
  } catch (error) {
    res.status(500).json({ error: "❌ خطأ في استرجاع الاختبارات: " + error.message });
  }
};

// ✅ استرجاع اختبار معين عبر ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title, difficulty, questions, created_at, user_id")
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ error: "❌ الاختبار غير موجود" });

    res.status(200).json({ quiz: data });
  } catch (error) {
    res.status(500).json({ error: "❌ خطأ في استرجاع الاختبار: " + error.message });
  }
};

// ✅ إنشاء اختبار جديد
exports.createQuiz = async (req, res) => {
  try {
    const { title, difficulty, questions } = req.body;
    const userId = req.user.id;

    if (!title || !difficulty || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "❌ جميع الحقول مطلوبة" });
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert([{ title, difficulty, questions, user_id: userId }]);

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: "✅ تم إنشاء الاختبار بنجاح", quiz: data });
  } catch (error) {
    res.status(500).json({ error: "❌ خطأ في إنشاء الاختبار: " + error.message });
  }
};

// ✅ تحديث اختبار معين
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, difficulty, questions } = req.body;
    const userId = req.user.id;

    // التحقق من ملكية المستخدم للاختبار
    const { data: existingQuiz, error: fetchError } = await supabase
      .from("quizzes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingQuiz) {
      return res.status(404).json({ error: "❌ الاختبار غير موجود" });
    }

    if (existingQuiz.user_id !== userId) {
      return res.status(403).json({ error: "❌ ليس لديك إذن لتعديل هذا الاختبار" });
    }

    // تحديث الاختبار
    const { data, error } = await supabase
      .from("quizzes")
      .update({ title, difficulty, questions })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: "✅ تم تحديث الاختبار بنجاح", quiz: data });
  } catch (error) {
    res.status(500).json({ error: "❌ خطأ في تحديث الاختبار: " + error.message });
  }
};

// ✅ حذف اختبار معين
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // التحقق من ملكية المستخدم للاختبار
    const { data: existingQuiz, error: fetchError } = await supabase
      .from("quizzes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingQuiz) {
      return res.status(404).json({ error: "❌ الاختبار غير موجود" });
    }

    if (existingQuiz.user_id !== userId) {
      return res.status(403).json({ error: "❌ ليس لديك إذن لحذف هذا الاختبار" });
    }

    // حذف الاختبار
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: "✅ تم حذف الاختبار بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "❌ خطأ في حذف الاختبار: " + error.message });
  }
};
