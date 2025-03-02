const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/authMiddleware");
const {
    getFlashcards,
    getFlashcardById,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard
} = require("../controllers/flashcardController");

// ✅ استرجاع جميع الفلاش كاردز مع دعم Pagination
router.get("/", protectRoute, getFlashcards);

// ✅ استرجاع فلاش كارد واحد عبر ID
router.get("/:id", protectRoute, getFlashcardById);

// ✅ إنشاء فلاش كارد جديد
router.post("/", protectRoute, createFlashcard);

// ✅ تحديث فلاش كارد معين
router.put("/:id", protectRoute, updateFlashcard);

// ✅ حذف فلاش كارد معين
router.delete("/:id", protectRoute, deleteFlashcard);

module.exports = router;
