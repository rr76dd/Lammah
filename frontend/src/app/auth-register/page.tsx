"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {supabase} from "@/utils/supabaseClient"; // ✅ استيراد Supabase

const universities = [
  "جامعة أم القرى", "الجامعة الإسلامية", "جامعة الإمام محمد بن سعود الإسلامية",
  "جامعة الملك سعود", "جامعة الملك عبدالعزيز", "جامعة الملك فهد للبترول والمعادن",
  "جامعة الملك فيصل", "جامعة الملك خالد", "جامعة القصيم", "جامعة طيبة", "جامعة الطائف",
  "جامعة حائل", "جامعة جازان", "جامعة الجوف", "جامعة الباحة", "جامعة تبوك", "جامعة نجران",
  "جامعة الحدود الشمالية", "جامعة الأميرة نورة بنت عبدالرحمن", "جامعة الملك سعود بن عبدالعزيز للعلوم الصحية",
  "جامعة الإمام عبدالرحمن بن فيصل", "جامعة الأمير سطام بن عبدالعزيز", "جامعة شقراء", "جامعة المجمعة",
  "الجامعة السعودية الإلكترونية", "جامعة جدة", "جامعة بيشة", "جامعة حفر الباطن",
  "جامعة الملك عبدالله للعلوم والتقنية", "جامعة الأمير سلطان", "جامعة اليمامة",
  "جامعة الفيصل", "جامعة عفت", "جامعة دار العلوم", "جامعة الأمير فهد بن سلطان",
  "جامعة الأمير محمد بن فهد", "جامعة رياض العلم", "جامعة المعرفة", "جامعة سليمان الراجحي",
  "جامعة المستقبل", "جامعة دار الحكمة"
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    educationLevel: "ثانوي",
    university: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // ✅ تتبع حالة إرسال التحقق من البريد
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        // ✅ التحقق مما إذا كان البريد الإلكتروني قد تم تأكيده
        const { data: userData, error } = await supabase.auth.getUser();

        if (error) {
          setError("❌ حدث خطأ أثناء التحقق من البريد الإلكتروني.");
          return;
        }

        if (!userData?.user?.email_confirmed_at) {
          setError("❌ يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول.");
          return;
        }

        // ✅ تحويل المستخدم إلى Dashboard فقط بعد التأكد من البريد
        router.replace("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEducationChange = (level: string) => {
    setFormData({
      ...formData,
      educationLevel: level,
      university: level === "جامعي" ? formData.university : "", // حذف الجامعة إذا كان المستوى "ثانوي"
    });
  };

  const validateInputs = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return "❌ جميع الحقول مطلوبة";
    }
    if (!formData.email.includes("@")) {
      return "❌ البريد الإلكتروني غير صالح";
    }
    if (formData.password.length < 6) {
      return "❌ يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل";
    }
    if (formData.password !== formData.confirmPassword) {
      return "❌ كلمة المرور وتأكيدها غير متطابقين";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // ✅ تسجيل المستخدم في Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          educationLevel: formData.educationLevel,
          university: formData.educationLevel === "جامعي" ? formData.university : null, // حفظ الجامعة فقط إذا كان المستخدم جامعيًا
        },
      },
    });

    if (authError) {
      setError("❌ " + authError.message);
      setLoading(false);
      return;
    }

    // ✅ انتظار تأكيد البريد الإلكتروني قبل السماح بالدخول
    setEmailSent(true);
    setError("✅ تم إرسال رسالة التحقق إلى بريدك الإلكتروني، يرجى التحقق قبل تسجيل الدخول.");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md p-4 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">إنشاء حساب جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-center">{error}</p>}

            <Input type="text" name="name" placeholder="الاسم" value={formData.name} onChange={handleChange} required />
            <Input type="email" name="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} required />
            <Input type="password" name="password" placeholder="كلمة المرور" value={formData.password} onChange={handleChange} required />
            <Input type="password" name="confirmPassword" placeholder="تأكيد كلمة المرور" value={formData.confirmPassword} onChange={handleChange} required />

            <div className="space-y-2">
          {/* العنوان */}
          <p className="text-sm font-medium">المستوى الدراسي</p>

          {/* الحاوية الرئيسية للأزرار */}
          <div className="flex items-center gap-4">
            {/* خيار "طالب ثانوي" */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="high-school"
                checked={formData.educationLevel === "ثانوي"}
                onCheckedChange={() => handleEducationChange("ثانوي")}
              />
              <label htmlFor="high-school" className="text-sm">
                طالب ثانوي
              </label>
            </div>

            {/* خيار "طالب جامعي" */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="university"
                checked={formData.educationLevel === "جامعي"}
                onCheckedChange={() => handleEducationChange("جامعي")}
              />
              <label htmlFor="university" className="text-sm">
                طالب جامعي
              </label>
            </div>
          </div>
        </div>

            {formData.educationLevel === "جامعي" && (
              <Select onValueChange={(value) => setFormData({ ...formData, university: value })} value={formData.university}>
                <SelectTrigger><SelectValue placeholder="اختر الجامعة" /></SelectTrigger>
                <SelectContent>
                  {universities.map((uni, index) => (
                    <SelectItem key={index} value={uni}>{uni}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button type="submit" className="w-full" disabled={loading || emailSent}>
              {loading ? "جاري التسجيل..." : "تسجيل"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
