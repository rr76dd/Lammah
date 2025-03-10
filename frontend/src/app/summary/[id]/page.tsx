"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";

interface Summary {
  id: string;
  content: string;
  file_id: string;
  created_at: string;
}

export default function SummaryViewer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace("/auth-login");
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    fetchSummary();
  }, [id]);

  const fetchSummary = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("summaries")
        .select("*")
        .eq("file_id", id)
        .single();

      if (error) throw error;
      setSummary(data);
    } catch (err) {
      console.error("❌ Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الملخص...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl">❌ لم يتم العثور على ملخص</div>
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
    <div className="flex h-screen bg-gray-50 overflow-hidden pt-20" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-sm rounded-2xl p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">ملخص المحتوى</h1>
              
              <div className="prose prose-lg max-w-none">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
                  <p className="text-gray-700 whitespace-pre-wrap">{summary.content}</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  العودة للمكتبة
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}