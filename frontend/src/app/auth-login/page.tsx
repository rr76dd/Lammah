"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc"; // Google icon
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("تسجيل الدخول:", { email, password });
  };

  const handleGoogleLogin = () => {
    console.log("تسجيل الدخول عبر Google");
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
              <Button className="w-full bg-black text-white p-3 text-lg" onClick={handleLogin}>
                تسجيل الدخول
              </Button>
              <div className="text-center text-gray-500 text-lg">أو</div>
              <Button
                className="w-full flex items-center justify-center border border-gray-300 p-3 text-lg"
                onClick={handleGoogleLogin}
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
