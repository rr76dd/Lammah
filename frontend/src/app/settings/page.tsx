"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Twitter } from "lucide-react";
import { Sidebar } from "@/components/Sidebar"; // شريط التنقل الجانبي

export default function SettingsPage() {
  // بيانات المستخدم
  const [user, setUser] = useState({
    name: "اسم المستخدم",
    email: "user@example.com",
    avatar: "/avatar-placeholder.png",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحديث اسم المستخدم أثناء الكتابة
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(event.target.value);
  };

  // حفظ الاسم الجديد
  const saveName = () => {
    setUser((prevUser) => ({
      ...prevUser,
      name: tempName,
    }));
    setIsEditing(false);

    console.log("تم تحديث الاسم في قاعدة البيانات:", tempName);
  };

  // عند الضغط على Enter يتم حفظ الاسم
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      saveName();
    }
  };

  // عند الضغط على الصورة، يتم فتح اختيار الملف
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // عند اختيار صورة جديدة، يتم تحديث الصورة فورًا
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser((prevUser) => ({
        ...prevUser,
        avatar: imageUrl,
      }));

      console.log("تم تحديث الصورة الشخصية في قاعدة البيانات:", file);
    }
  };

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      {/* شريط التنقل الجانبي */}
      <Sidebar />

      {/* محتوى الصفحة */}
      <div className="flex flex-col items-center w-full p-6 flex-grow overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400">
        
        {/* معلومات المستخدم */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200 p-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold">معلومات المستخدم</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
            {/* الصورة الشخصية مع إمكانية التعديل */}
            <div
              className="flex-shrink-0 sm:mb-0 mb-4 p-2 border-2 border-gray-300 rounded-full cursor-pointer hover:opacity-80 transition"
              onClick={handleAvatarClick}
            >
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />

            <div className="flex flex-col space-y-2 w-full p-3">
              {isEditing ? (
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={tempName}
                    onChange={handleNameChange}
                    onBlur={saveName}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="bg-gray-100 text-black border border-gray-400 rounded-lg p-2 flex-grow"
                  />
                  <Button onClick={saveName} className="bg-black text-white px-4">
                    حفظ
                  </Button>
                </div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-gray-600" onClick={() => setIsEditing(true)}>
                  {user.name}
                </p>
              )}
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* نبذة عن الموقع */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200 p-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold">نبذة عن الموقع</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لماح منصة تعليمية تساعد الطلاب على تلخيص الدروس وإنشاء اختبارات ذكية باستخدام الذكاء الاصطناعي.</p>
          </CardContent>
        </Card>

        {/* التواصل مع لماح */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200 p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">التواصل مع لماح</CardTitle>
          </CardHeader>
          <CardContent>
            <p>تابع حساباتنا على تويتر:</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
              <Link href="https://twitter.com/lammah_ai" target="_blank" className="w-full">
                <Button className="bg-black text-white flex items-center justify-center space-x-2 w-full">
                  <Twitter className="w-5 h-5 text-white" />
                  <span>حساب لماح</span>
                </Button>
              </Link>
              <Link href="https://twitter.com/dev_twitter" target="_blank" className="w-full">
                <Button className="bg-black text-white flex items-center justify-center space-x-2 w-full">
                  <Twitter className="w-5 h-5 text-white" />
                  <span>حساب المطور</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* بطاقة الإعدادات الإضافية */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200 p-6">
        <CardHeader>
            <CardTitle className="text-xl font-bold">الإعدادات الإضافية</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
            <a href="mailto:support@lammah.com" className="w-full">
                <Button className="bg-black text-white flex items-center justify-center space-x-2 w-full">
                <span>الإبلاغ عن مشكلة</span>
                </Button>
            </a>
            <Link href="/privacy-policy" className="w-full">
                <Button className="bg-black text-white flex items-center justify-center space-x-2 w-full">
                <span>سياسة الخصوصية</span>
                </Button>
            </Link>
                    {/* تسجيل الخروج */}
                <div className="flex flex-col items-center w-full max-w-2xl">
                <Button className="bg-red-600 text-white shadow-lg hover:bg-red-700 w-full py-3 text-lg">
                    تسجيل الخروج
                </Button>

                </div>
            </div>
        </CardContent>
        </Card>
        <div className="mt-4 text-center pb-40 sm:pb-10">
            <span className="text-gray-500 text-sm">
              لماح - الإصدار 1.0.0 | صنع بـ ❤️ بواسطة فهد
            </span>
          </div>
      </div>
    </div>
  );
}
