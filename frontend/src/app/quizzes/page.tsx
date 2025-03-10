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

        setFiles(data as FileData[]);
      } catch (err) {
        console.error("❌ خطأ أثناء تحميل الملفات:", err);
        setError("❌ حدث خطأ أثناء تحميل الملفات.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // ✅ جلب قائمة الاختبارات
  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.from("quizzes").select("id, title, difficulty, created_at");

      if (error) throw error;

      setQuizzes(data as Quiz[]);
    } catch (err) {
      console.error("❌ خطأ أثناء تحميل الاختبارات:", err);
      setError("❌ حدث خطأ أثناء تحميل الاختبارات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ✅ إنشاء اختبار جديد تلقائيًا باستخدام الذكاء الاصطناعي مع عنوان ديناميكي
  const generateQuiz = async () => {
    if (!selectedFile) {
      setError("❌ يرجى اختيار ملف لإنشاء الاختبار.");
      return;
    }

    setGenerating(true);
    setShowDialog(false);
    setError("");

    try {
      const file = files.find(f => f.id === selectedFile);
      if (!file) throw new Error("❌ الملف غير موجود.");

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          action: "quiz",
          fileContent: file.content // Using content from FileData interface
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "❌ فشل في معالجة الملف.");
      }

      const { result } = await response.json();
      if (!result || !result.quizId || !result.title) {
        throw new Error("❌ فشل في إنشاء الاختبار.");
      }

      // Refresh the quizzes list
      await fetchQuizzes();
      
      // Show success message
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("❌ خطأ أثناء إنشاء الاختبار:", err);
      setError(typeof err === 'string' ? err : err instanceof Error ? err.message : "❌ حدث خطأ أثناء إنشاء الاختبار.");
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
          {error && <p className="text-red-500 text-center">{error}</p>}
          {generating && <p className="text-center text-blue-600">🔄 جاري توليد الاختبار...</p>}

          <Button className="w-full bg-blue-600 text-white mb-4" onClick={() => setShowDialog(true)} disabled={generating}>
            {generating ? "جاري التوليد..." : "إنشاء اختبار جديد"}
          </Button>

          {loading ? <p className="text-center text-gray-600">جاري تحميل الاختبارات...</p> : (
            <ul className="space-y-4">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="flex justify-between items-center border p-3 rounded shadow-sm">
                  <div>
                    <p className="font-semibold">{quiz.title}</p>
                    <p className="text-sm text-gray-500">الصعوبة: {quiz.difficulty}</p>
                  </div>
                  <div className="space-x-2">
                    <Button className="bg-green-600 text-white" onClick={() => router.push(`/quizzes/${quiz.id}`)}>
                      عرض الاختبار
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء اختبار جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg font-semibold">اختر الملف لإنشاء الاختبار منه:</p>

            <Select onValueChange={setSelectedFile} value={selectedFile || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="اختر ملفًا" />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="w-full bg-blue-600 text-white" onClick={generateQuiz} disabled={generating || !selectedFile}>
              {generating ? "جاري التوليد..." : "إنشاء الاختبار"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
