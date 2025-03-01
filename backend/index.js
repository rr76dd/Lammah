const express = require("express");
const supabase = require("./supabaseClient");
const quizRoutes = require("./routes/quizRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");



const app = express();
app.use(express.json()); // لدعم JSON في الطلبات
app.use("/quizzes", quizRoutes);
app.use("/flashcards", flashcardRoutes);


// 📂 API: رفع ملف جديد
app.post("/upload-file", async (req, res) => {
    const { userId, fileName, fileUrl, fileType } = req.body;

    console.log("📥 Received data:", req.body); // ✅ طباعة البيانات المستقبلة

    const { data, error } = await supabase
        .from("uploaded_files")
        .insert([{ 
            user_id: userId, 
            file_name: fileName, 
            file_url: fileUrl, 
            file_type: fileType 
        }])
        .select(); // ✅ استخدام .select() لجلب البيانات المدخلة

    if (error) {
        console.error("🔥 Supabase Error:", error);
        return res.status(400).json({ error: error.message });
    }

    console.log("✅ File inserted successfully:", data);
    res.json({ message: "File uploaded successfully", data });
});





// ✅ تشغيل السيرفر
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
