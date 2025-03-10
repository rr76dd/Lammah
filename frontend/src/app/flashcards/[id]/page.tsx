"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export default function FlashcardViewer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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
    fetchFlashcards();
  }, [id]);

  const fetchFlashcards = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("file_id", id);

      if (error) throw error;
      setFlashcards(data || []);
    } catch (err) {
      console.error("❌ Error fetching flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const previousCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البطاقات...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl">❌ لم يتم العثور على بطاقات</div>
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
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>البطاقة {currentIndex + 1} من {flashcards.length}</span>
                <span>{Math.round(((currentIndex + 1) / flashcards.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Flashcard */}
            <div className="relative min-h-[300px] mb-8">
              <motion.div
                className={`w-full bg-gradient-to-br p-8 rounded-xl shadow-md cursor-pointer
                  ${isFlipped ? 'from-purple-50 to-purple-100' : 'from-blue-50 to-blue-100'}`}
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className={`text-center ${isFlipped ? 'rotate-180' : ''}`}>
                  <h3 className="text-xl font-semibold mb-4">
                    {isFlipped ? 'الإجابة' : 'السؤال'}
                  </h3>
                  <p className="text-gray-700">
                    {isFlipped ? flashcards[currentIndex].answer : flashcards[currentIndex].question}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousCard}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={flashcards.length <= 1}
              >
                السابق
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isFlipped ? 'إظهار السؤال' : 'إظهار الإجابة'}
              </button>

              <button
                onClick={nextCard}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={flashcards.length <= 1}
              >
                التالي
              </button>
            </div>

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