"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

interface Tool {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
}

// ⬇️ بيانات الفئات - يمكن استبدالها بالبيانات الفعلية من قاعدة البيانات
// كيفية إضافة فئة جديدة:
// 1. قم بإنشاء كائن جديد بنفس الهيكل أدناه
// 2. أعطِ الفئة معرف فريد (id) واسم ووصف
// 3. أضف مصفوفة من الأدوات داخل الفئة

// ⬇️ شرح كيفية إضافة أداة جديدة:
// 1. يمكنك إضافة أداة جديدة عن طريق إضافة كائن جديد إلى مصفوفة tools في الفئة المناسبة
// 2. تأكد من إعطاء الأداة معرف فريد (id) واسم ووصف وصورة
// 3. يجب أن يكون معرف الفئة (category) مطابقًا لمعرف الفئة التي تنتمي إليها الأداة
// 4. مثال على إضافة أداة جديدة:
//    {
//      id: "1-9",  // معرف فريد للأداة
//      name: "اسم الأداة الجديدة",
//      description: "وصف الأداة الجديدة",
//      image: "/images/tool-image.png",  // مسار الصورة
//      category: "1"  // معرف الفئة التي تنتمي إليها الأداة
//    }
const categories: Category[] = [
  {
    id: "1",
    name: "أدوات الدراسة",
    description: "أدوات تساعدك على تنظيم وتحسين دراستك",
    tools: Array(8).fill(null).map((_, i) => ({
      id: `1-${i}`,
      name: `أداة ${i + 1}`,
      description: "وصف الأداة التعليمية",
      image: "/images/tool-placeholder.png",
      category: "1"
    }))
  },
  // ⬇️ مثال على كيفية إضافة فئة جديدة
  {
    id: "2",
    name: "أدوات الذكاء الاصطناعي",
    description: "أدوات ذكاء اصطناعي لمساعدتك في التعلم",
    tools: Array(4).fill(null).map((_, i) => ({
      id: `2-${i}`,
      name: `أداة ذكية ${i + 1}`,
      description: "وصف أداة الذكاء الاصطناعي",
      image: "/images/tool-placeholder.png",
      category: "2"
    }))
  },
  // ⬇️ كيفية إضافة فئة جديدة يدويًا:
  // {
  //   id: "3",  // معرف فريد للفئة
  //   name: "اسم الفئة الجديدة",
  //   description: "وصف الفئة الجديدة",
  //   tools: [  // مصفوفة من الأدوات
  //     {
  //       id: "3-0",
  //       name: "اسم الأداة الأولى",
  //       description: "وصف الأداة الأولى",
  //       image: "/images/tool-placeholder.png",
  //       category: "3"
  //     },
  //     // يمكنك إضافة المزيد من الأدوات هنا
  //   ]
  // },
  // يمكنك إضافة المزيد من الفئات حسب الحاجة
];

export default function ToolsPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");
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

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // تصفية الأدوات بناءً على مصطلح البحث
  const filteredCategories = searchTerm.trim() === '' 
    ? categories 
    : categories.map(category => ({
        ...category,
        tools: category.tools.filter(tool => 
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.tools.length > 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-16 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-sm rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
              <div className="text-center sm:text-right">
                <h1 className="text-3xl font-bold text-gray-900">الأدوات</h1>
                <p className="text-gray-500 mt-1">مجموعة من الأدوات المفيدة لمساعدتك في دراستك</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن أداة..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Search className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* ⬇️ عرض الفئات المصفاة بناءً على البحث */}
            {filteredCategories.map((category) => (
              <section key={category.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{category.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
                  </div>
                </div>

                {/* ⬇️ تعديل شبكة العرض: 
                    - 1 عنصر في الصف للشاشات الصغيرة (الافتراضي grid-cols-1)
                    - 3 عناصر في الصف للشاشات المتوسطة (md:grid-cols-3)
                    - 6 عناصر في الصف للشاشات الكبيرة (xl:grid-cols-6)
                */}
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  {category.tools
                    .slice(0, expandedCategories.has(category.id) ? undefined : 6)
                    .map((tool) => (
                      <Card key={tool.id} className="group hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-4">
                          {/* ⬇️ تقليل حجم الصورة إلى ارتفاع 24 بدلاً من 32 لتناسب البطاكات الأصغر */}
                          <div className="h-24 relative mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <Image
                              src={tool.image}
                              alt={tool.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">{tool.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{tool.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {category.tools.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => toggleCategory(category.id)}
                      className="group"
                    >
                      {expandedCategories.has(category.id) ? "عرض أقل" : "عرض المزيد"}
                      <ChevronRight className={`mr-2 h-4 w-4 transition-transform group-hover:translate-x-1 ${expandedCategories.has(category.id) ? 'rotate-90' : ''}`} />
                    </Button>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}