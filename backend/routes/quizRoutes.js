const express = require("express");
const { generateQuiz, getQuiz } = require("../controllers/quizController");

const router = express.Router();

// ✅ إنشاء اختبار من الفلاش كاردز الخاصة بملف معين
router.post("/generate", generateQuiz);

// ✅ جلب اختبار معين مع أسئلته
router.get("/:quizId", getQuiz);

module.exports = router;
