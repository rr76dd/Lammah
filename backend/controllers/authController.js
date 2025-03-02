const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ تسجيل مستخدم جديد
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "❌ البريد الإلكتروني وكلمة المرور مطلوبان" });
        }

        // إضافة المستخدم إلى Supabase بدون تشفير يدوي
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({
            message: "✅ تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتفعيل الحساب.",
            user: data.user
        });
    } catch (error) {
        res.status(500).json({ error: "❌ خطأ في السيرفر: " + error.message });
    }
};

// ✅ تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "❌ البريد الإلكتروني وكلمة المرور مطلوبان" });
        }

        // تسجيل الدخول عبر Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return res.status(400).json({ error: error.message });

        // الحصول على بيانات المستخدم بعد تسجيل الدخول
        const { user } = data;
        if (!user) return res.status(401).json({ error: "❌ لا يمكن جلب بيانات المستخدم." });

        // إنشاء توكين JWT يحتوي على معلومات المستخدم
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || "user" }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "✅ تم تسجيل الدخول بنجاح!",
            token,
            user: { id: user.id, email: user.email, role: user.role || "user" }
        });
    } catch (error) {
        res.status(500).json({ error: "❌ خطأ في السيرفر: " + error.message });
    }
};
