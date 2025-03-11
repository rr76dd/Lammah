"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {supabase} from "@/utils/supabaseClient";

// ✅ تعريف هيكل البيانات
interface Question {
  question?: string;
  text?: string;
  choices?: string[];
  options?: string[];
  correctAnswer?: string;
  correct_answer?: string;
}

interface NormalizedQuestion {
  text: string;
  choices: string[];
  correctAnswer: string;
}

interface Quiz {
  id: string;
  title: string;
  difficulty?: string;
  questions: NormalizedQuestion[]; // Now always an array of normalized questions
}

export default function QuizDetailsPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const router = useRouter();
  const { id } = useParams();

  // Calculate total questions and current progress
  const totalQuestions = quiz?.questions?.length || 0;
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  // ✅ التحقق من تسجيل الدخول
  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace("/auth-login");
      }
    };
    checkUser();
  }, [router]);

  // ✅ جلب بيانات الاختبار
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("id, title, difficulty, questions")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Parse questions if they're stored as a JSON string
        let parsedQuestions: Question[] = [];
        
        if (typeof data.questions === 'string') {
          try {
            parsedQuestions = JSON.parse(data.questions);
          } catch (parseError) {
            console.error('Error parsing questions JSON:', parseError);
            throw new Error('فشل في تحليل بيانات الأسئلة');
          }
        } else if (Array.isArray(data.questions)) {
          parsedQuestions = data.questions;
        }

        if (!parsedQuestions || parsedQuestions.length === 0) {
          throw new Error('لا توجد أسئلة في هذا الاختبار');
        }
        
        // Normalize question format
        const normalizedQuestions: NormalizedQuestion[] = parsedQuestions.map(q => ({
          text: q.question || q.text || 'No question text',
          choices: q.choices || q.options || [],
          correctAnswer: q.correctAnswer || q.correct_answer || ''
        }));

        // Validate questions
        normalizedQuestions.forEach((q, index) => {
          if (!q.text || !Array.isArray(q.choices) || q.choices.length === 0 || !q.correctAnswer) {
            throw new Error(`السؤال رقم ${index + 1} غير مكتمل`);
          }
        });

        setQuiz({
          id: data.id,
          title: data.title || 'اختبار',
          difficulty: data.difficulty,
          questions: normalizedQuestions
        });
      } catch (err) {
        console.error("Error loading quiz:", err);
        setError(err instanceof Error ? err.message : "فشل في تحميل الاختبار");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Navigation between questions
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">جاري تحميل الاختبار...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Button onClick={() => router.push('/quizzes')}>
          العودة إلى قائمة الاختبارات
        </Button>
      </div>
    );
  }

  if (!quiz || !currentQuestion) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">لا يوجد اختبار متاح</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {quiz.title} - مراجعة
          </CardTitle>
          <div className="flex justify-between items-center mt-4">
            <p className="text-gray-600">
              مستوى الصعوبة: {
                quiz.difficulty === 'easy' ? 'سهل' :
                quiz.difficulty === 'medium' ? 'متوسط' :
                'صعب'
              }
            </p>
            <p className="text-gray-600">
              السؤال {currentQuestionIndex + 1} من {totalQuestions}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {/* Question Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                onClick={() => navigateToQuestion(index)}
                className={`w-10 h-10 ${
                  currentQuestionIndex === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {/* Current Question */}
          <div className="border p-6 rounded-lg shadow-sm">
            <p className="text-lg mb-6">{currentQuestion.text}</p>
            
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, choiceIndex) => (
                <div
                  key={choiceIndex}
                  className={`p-3 rounded-lg ${
                    choice === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-gray-100'
                  }`}
                >
                  {choice}
                  {choice === currentQuestion.correctAnswer && (
                    <span className="text-green-600 ml-2">✓ الإجابة الصحيحة</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500"
            >
              السؤال السابق
            </Button>
            <Button
              onClick={() => router.push('/quizzes')}
              className="bg-blue-600"
            >
              العودة إلى قائمة الاختبارات
            </Button>
            <Button
              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="bg-gray-500"
            >
              السؤال التالي
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
