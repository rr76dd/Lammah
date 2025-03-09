require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));



// ✅ تأكد من استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const quizRoutes = require('./routes/quizRoutes');
const flashcardRoutes = require('./routes/flashCardRoutes'); 
app.use('/api/chat', chatRoutes);
// ✅ تأكد من استخدام `app.use()` بشكل صحيح
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
