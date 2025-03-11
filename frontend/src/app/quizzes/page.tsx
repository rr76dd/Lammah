"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/utils/supabaseClient";

// ✅ تحديد نوع بيانات الاختبار والملفات
interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  created_at: string;
}

interface FileData {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

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

  // ✅ جلب قائمة الملفات من Supabase
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("files")
          .select("id, name, content, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFiles(data || []);
        setError(""); // Clear any previous errors even if the array is empty
      } catch (err) {
        console.error("Error loading files:", err);
        setError("حدث خطأ أثناء تحميل الملفات.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // ✅ جلب قائمة الاختبارات
  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title, difficulty, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (err) {
      console.error("Error loading quizzes:", err);
      // Don't set error here as it might be displayed incorrectly
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ✅ إنشاء اختبار جديد
  const generateQuiz = async () => {
    if (!selectedFile) {
      setError("يرجى اختيار ملف لإنشاء الاختبار.");
      return;
    }

    setGenerating(true);
    setShowDialog(false);
    setError("");

    try {
      const file = files.find(f => f.id === selectedFile);
      if (!file) throw new Error("الملف غير موجود.");

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          action: "quiz",
          fileContent: file.content,
          difficulty: selectedDifficulty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في معالجة الملف.");
      }

      const data = await response.json();
      if (data.result?.quizId) {
        router.push(`/quizzes/${data.result.quizId}`);
      }

      await fetchQuizzes();
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الاختبار.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-2xl p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">إدارة الاختبارات</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {generating && <p className="text-center text-blue-600 mb-4">جاري توليد الاختبار...</p>}

          <Button 
            className="w-full bg-blue-600 text-white mb-6" 
            onClick={() => setShowDialog(true)} 
            disabled={generating}
          >
            {generating ? "جاري التوليد..." : "إنشاء اختبار جديد"}
          </Button>

          {quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="flex flex-col gap-2 border p-4 rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{quiz.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty === 'easy' ? 'سهل' :
                       quiz.difficulty === 'medium' ? 'متوسط' :
                       'صعب'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(quiz.created_at).toLocaleDateString('ar-SA')}
                  </p>
                  <Button 
                    className="w-full bg-green-600 text-white mt-2" 
                    onClick={() => router.push(`/quizzes/${quiz.id}`)}
                  >
                    مراجعة الاختبار
                  </Button>
                </div>
              ))}
            </div>
          ) : loading ? (
            <p className="text-center text-gray-600">جاري تحميل الاختبارات...</p>
          ) : (
            <p className="text-center text-gray-500">لا توجد اختبارات حالياً</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء اختبار جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اختر الملف:</label>
              <Select onValueChange={setSelectedFile} value={selectedFile || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر ملفاً" />
                </SelectTrigger>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">مستوى الصعوبة:</label>
              <Select onValueChange={setSelectedDifficulty} value={selectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستوى الصعوبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">سهل</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="hard">صعب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-blue-600 text-white" 
              onClick={generateQuiz} 
              disabled={generating || !selectedFile}
            >
              {generating ? "جاري التوليد..." : "إنشاء الاختبار"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
