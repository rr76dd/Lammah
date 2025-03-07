"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import Link from "next/link";
import {supabase} from "@/utils/supabaseClient"; // ✅ استيراد supabase

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // ✅ تخزين رسائل الخطأ
  const [loading, setLoading] = useState(false); // ✅ إضافة مؤشر التحميل
  const router = useRouter();

  // ✅ منع المستخدم المسجل من الوصول إلى صفحة تسجيل الدخول
  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        router.replace("/dashboard"); // ✅ استخدام replace بدلاً من push لتجنب الرجوع إلى صفحة تسجيل الدخول
      }
    };
    checkUser();
  }, [router]);

  // ✅ تسجيل الدخول باستخدام البريد وكلمة المرور
  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("❌ البريد الإلكتروني وكلمة المرور مطلوبان");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("❌ " + error.message);
      return;
    }

    // ✅ إعادة التوجيه بعد نجاح تسجيل الدخول
    router.push("/dashboard");
  };

  // ✅ تسجيل الدخول باستخدام Google
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    setLoading(false);

    if (error) {
      setError("❌ " + error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-5xl flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden">
        {/* Left Section - Login Form */}
        <div className="w-full md:w-3/5 p-10 flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-3xl text-center font-bold">
              مرحبًا بعودتك!
            </CardTitle>
            <p className="text-gray-600 text-center">
              سجل دخولك للمتابعة والاستفادة من مميزات المنصة
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* ✅ عرض رسالة الخطأ إن وجدت */}
              {error && <p className="text-red-500 text-center">{error}</p>}

              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 text-lg"
              />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 text-lg"
              />
              <div className="text-right text-sm text-blue-500 cursor-pointer">
                هل نسيت كلمة المرور؟
              </div>
              <Button
                className="w-full bg-black text-white p-3 text-lg"
                onClick={handleLogin}
                disabled={loading} // ✅ تعطيل الزر أثناء التحميل
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
              <div className="text-center text-gray-500 text-lg">أو</div>
              <Button
                className="w-full flex items-center justify-center border border-gray-300 p-3 text-lg"
                onClick={handleGoogleLogin}
                disabled={loading} // ✅ تعطيل الزر أثناء التحميل
              >
                <FcGoogle className="text-2xl mr-2" />
                تسجيل الدخول عبر Google
              </Button>

              {/* رابط التسجيل */}
              <p className="text-center text-sm mt-4">
                ليس لديك حساب؟{" "}
                <Link href="/auth-register" className="text-blue-600 hover:underline">
                  أنشئ حسابًا الآن
                </Link>
              </p>
            </div>
          </CardContent>
        </div>

        {/* Right Section - Illustration */}
        <div className="hidden md:flex w-2/5 items-center justify-center p-10">
          <div className="text-center">
            <Image
              src="/images/login-illustration.png"
              alt="توضيح تسجيل الدخول"
              width={300}
              height={300}
            />
            <p className="text-gray-700 mt-6 text-lg">
              قم بإدارة دراستك بسهولة مع <span className="font-bold">لماح</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
