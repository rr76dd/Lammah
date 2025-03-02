const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/authMiddleware");
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

// ✅ استرجاع جميع الاختبارات مع دعم Pagination
router.get("/", protectRoute, getQuizzes);

// ✅ استرجاع اختبار معين عبر ID
router.get("/:id", protectRoute, getQuizById);

// ✅ إنشاء اختبار جديد
router.post("/", protectRoute, createQuiz);

// ✅ تحديث اختبار معين
router.put("/:id", protectRoute, updateQuiz);

// ✅ حذف اختبار معين
router.delete("/:id", protectRoute, deleteQuiz);

module.exports = router;
