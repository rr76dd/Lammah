"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "@/utils/supabaseClient";

// ✅ تعريف هيكل البيانات
interface Question {
  text: string;
  choices: string[];
  correctAnswer: string;
}

interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  questions: Question[];
}

export default function QuizDetailsPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const { id } = useParams<{ id: string }>(); // ✅ جلب ID الاختبار مع النوع الصحيح

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

        setQuiz(data as Quiz);
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الاختبار:", err);
        setError("❌ لم يتم العثور على الاختبار.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // ✅ تحديث إجابة المستخدم لكل سؤال
  const handleAnswerSelect = (questionIndex: number, choice: string) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: choice });
  };

  // ✅ حساب النتيجة النهائية وتحليل الإجابات
  const calculateScore = () => {
    if (!quiz) return;

    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    setScore((correctAnswers / quiz.questions.length) * 100); // ✅ نسبة النتيجة من 100%
    setShowResults(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-3xl p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">حل الاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ✅ عرض رسالة الخطأ إن وجدت */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* ✅ عرض معلومات الاختبار */}
          {loading ? (
            <p className="text-center text-gray-600">جاري تحميل الاختبار...</p>
          ) : quiz ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">{quiz.title}</h2>
              <p className="text-gray-600 text-center">مستوى الصعوبة: {quiz.difficulty}</p>

              {/* ✅ عرض الأسئلة */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">الأسئلة:</h3>
                {quiz.questions?.length > 0 ? (
                  <ul className="space-y-4">
                    {quiz.questions.map((question, index) => (
                      <li key={index} className="border p-4 rounded shadow-sm">
                        <p className="font-semibold">{index + 1}. {question.text}</p>
                        <div className="mt-2 space-y-2">
                          {question.choices.map((choice, i) => (
                            <Button
                              key={i}
                              className={`w-full ${
                                userAnswers[index] === choice 
                                  ? "bg-blue-500 text-white" 
                                  : "bg-gray-200"
                              }`}
                              onClick={() => handleAnswerSelect(index, choice)}
                            >
                              {choice}
                            </Button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">لا يوجد أسئلة في هذا الاختبار</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">لا يوجد بيانات متاحة</p>
          )}

          {/* ✅ زر لحساب النتيجة وعرضها */}
          {quiz && quiz.questions.length > 0 && !showResults && (
            <Button className="mt-6 bg-green-600 text-white w-full" onClick={calculateScore}>
              تقديم الاختبار وعرض النتيجة
            </Button>
          )}

          {/* ✅ عرض النتيجة بعد التقديم */}
          {showResults && (
            <div className="mt-6 text-center">
              <p className="text-xl font-bold">نتيجتك: {score?.toFixed(2)}%</p>
              <p className="text-gray-600">تحليل الإجابات:</p>
              <ul className="mt-4 space-y-2">
                {quiz?.questions.map((question, index) => (
                  <li key={index} className={`p-3 rounded ${userAnswers[index] === question.correctAnswer ? "bg-green-100" : "bg-red-100"}`}>
                    <p className="font-semibold">{question.text}</p>
                    <p>إجابتك: {userAnswers[index]}</p>
                    <p className="font-semibold">
                      {userAnswers[index] === question.correctAnswer ? "✅ إجابة صحيحة" : `❌ الإجابة الصحيحة: ${question.correctAnswer}`}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* زر الرجوع إلى قائمة الاختبارات */}
          <Button className="mt-6 bg-blue-600 text-white w-full" onClick={() => router.push("/quizzes")}>
            الرجوع إلى قائمة الاختبارات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
