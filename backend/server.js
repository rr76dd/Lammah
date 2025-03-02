require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ✅ تأكد من استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const quizRoutes = require('./routes/quizRoutes');
const flashcardRoutes = require('./routes/flashCardRoutes'); 

// ✅ تأكد من استخدام `app.use()` بشكل صحيح
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
