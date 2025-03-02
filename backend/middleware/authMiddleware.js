const supabase = require("../config/supabase");

const protectRoute = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // استخراج التوكن من الهيدر

  if (!token) return res.status(401).json({ error: "❌ غير مصرح لك" });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) return res.status(401).json({ error: "❌ الجلسة غير صالحة" });

  req.user = data.user; // تخزين بيانات المستخدم في الطلب
  next();
};

module.exports = protectRoute;
