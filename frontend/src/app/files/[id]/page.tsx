"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";

interface FileData {
  id: string;
  name: string;
  file_name?: string;
  size: number;
  type: string;
  url: string;
  folderName?: string;
  folder_name?: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
  content?: string;
}

interface ProcessingResult {
  success: boolean;
  data?: ProcessedData;
  error?: string;
}

interface ProcessedData {
  quizId?: string;
  summary?: string;
  flashcards?: Array<{
    question: string;
    answer: string;
  }>;
}

export default function FileViewer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  useEffect(() => {
    fetchFileDetails();
  }, [id]);

  const fetchFileDetails = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("uploaded_files")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Error fetching file details:", error);
        setFile(null);
        return;
      }
      
      // Additional check to ensure file exists
      if (!data) {
        console.error("❌ File not found in database");
        setFile(null);
        return;
      }
      
      setFile(data);
    } catch (err) {
      console.error("❌ Error fetching file details:", err);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (action: "quiz" | "summary" | "flashcards") => {
    if (!file) return;

    setProcessing(true);
    setResult(null);

    try {
      const response = await fetch(`/api/process-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.id,
          action,
          fileUrl: file.file_url || file.url
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setResult({
        success: true,
        data: data.result
      });

      // Redirect to appropriate page based on action
      if (action === "quiz") {
        router.push(`/quizzes/${data.result.quizId}`);
      }
    } catch (err) {
      console.error(`❌ Error processing file for ${action}:`, err);
      setResult({
        success: false,
        error: `Failed to process file for ${action}. Please try again.`
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الملف...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl">❌ لم يتم العثور على الملف</div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-sm rounded-2xl p-6">
            {/* File Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{file.file_name || file.name}</h1>
              <p className="text-gray-500">
                {((file.file_size || file.size) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {/* Processing Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => processFile("quiz")}
                disabled={processing}
                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">إنشاء اختبار</h3>
                <p className="text-gray-600 text-sm">توليد اختبار متعدد الخيارات من محتوى الملف</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => processFile("summary")}
                disabled={processing}
                className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">تلخيص المحتوى</h3>
                <p className="text-gray-600 text-sm">الحصول على ملخص ذكي لمحتوى الملف</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => processFile("flashcards")}
                disabled={processing}
                className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">🗂️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">بطاقات تعليمية</h3>
                <p className="text-gray-600 text-sm">إنشاء بطاقات تعليمية تفاعلية من المفاهيم الرئيسية</p>
              </motion.button>
            </div>

            {/* Processing Status */}
            {processing && (
              <div className="mt-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">جاري معالجة الملف...</p>
              </div>
            )}

            {/* Result Status */}
            {result && (
              <div className={`mt-8 p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-center ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.success ? '✅ تمت المعالجة بنجاح' : result.error}
                </p>
              </div>
            )}

            {/* Back Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                العودة للمكتبة
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}