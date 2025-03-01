const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ تسجيل مستخدم جديد
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إضافة المستخدم إلى Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password: hashedPassword
        });

        if (error) throw error;

        res.status(201).json({ message: "تم إنشاء الحساب بنجاح!", user: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
        }

        // التحقق من المستخدم
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // إنشاء توكين JWT
        const token = jwt.sign({ id: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "تم تسجيل الدخول بنجاح!", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
