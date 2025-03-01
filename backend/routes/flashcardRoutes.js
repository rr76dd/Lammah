const express = require("express");
const { generateFlashcards, getFlashcardsByFile, getFlashcardsByUser } = require("../controllers/flashcardController");

const router = express.Router();

// ✅ إنشاء فلاش كاردز لملف معين
router.post("/generate", generateFlashcards);

// ✅ استرجاع الفلاش كاردز الخاصة بملف معين
router.get("/:fileId", getFlashcardsByFile);

// ✅ استرجاع جميع الفلاش كاردز الخاصة بمستخدم معين
router.get("/user/:userId", getFlashcardsByUser);

module.exports = router;
