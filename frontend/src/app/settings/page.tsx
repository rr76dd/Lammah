"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Twitter, Mail, Shield, LogOut, Camera, Save, User } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  // User data
  const [user, setUser] = useState({
    name: "اسم المستخدم",
    email: "user@example.com",
    avatar: "/avatar-placeholder.png",
    notifications: {
      email: true,
      app: true,
    },
    theme: "light",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update username while typing
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(event.target.value);
  };

  // Save new name
  const saveName = async () => {
    if (!tempName.trim()) {
      toast.error("خطأ", {
        description: "لا يمكن أن يكون الاسم فارغًا",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUser((prevUser) => ({
        ...prevUser,
        name: tempName,
      }));
      setIsEditing(false);
      
      toast.success("تم الحفظ", {
        description: "تم تحديث المعلومات الشخصية بنجاح",
      });
    } catch (error) {
      toast.error("حدث خطأ", {
        description: "فشل تحديث المعلومات، الرجاء المحاولة مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save on Enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      saveName();
    }
  };

  // Open file selector when clicking on avatar
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Update avatar when new image is selected
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الملف كبير", {
          description: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
        });
        return;
      }

      setIsLoading(true);
      
      // Simulate API upload
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const imageUrl = URL.createObjectURL(file);
        setUser((prevUser) => ({
          ...prevUser,
          avatar: imageUrl,
        }));
        
        toast.success("تم التحديث", {
          description: "تم تحديث الصورة الشخصية بنجاح",
        });
      } catch (error) {
        toast.error("حدث خطأ", {
          description: "فشل تحديث الصورة، الرجاء المحاولة مرة أخرى",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle notification toggles
  const toggleNotification = (type: 'email' | 'app') => {
    setUser(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
    
    toast.success("تم التحديث", {
      description: `تم تحديث إعدادات الإشعارات بنجاح`,
    });
  };

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = user.theme === 'light' ? 'dark' : 'light';
    setUser(prev => ({
      ...prev,
      theme: newTheme
    }));
    
    toast.success("تم التحديث", {
      description: `تم تغيير المظهر إلى النمط ${newTheme === 'light' ? 'الفاتح' : 'الداكن'}`,
    });
  };

  // Handle logout
  const handleLogout = () => {
    // Replace with actual logout logic
    toast("جاري تسجيل الخروج", {
      description: "سيتم تحويلك للصفحة الرئيسية..."
    });
    
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <Sidebar />

      {/* Page content */}
      <div className="flex flex-col items-center w-full p-6 flex-grow overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400">
        <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
        
        {/* User information */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5" />
              معلومات المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center space-x-0 space-x-reverse sm:space-x-6 sm:space-x-reverse">
            {/* Avatar with edit option */}
            <div className="relative mb-4 sm:mb-0">
              <div
                className="flex-shrink-0 p-1 border-2 border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition group"
                onClick={handleAvatarClick}
                aria-label="تغيير الصورة الشخصية"
              >
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
                  <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />

            <div className="flex flex-col space-y-4 w-full p-3">
              <div>
                <Label htmlFor="username" className="text-sm text-gray-500 mb-1 block">الاسم</Label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      type="text"
                      value={tempName}
                      onChange={handleNameChange}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="bg-gray-100 text-black border border-gray-400 rounded-lg p-2 flex-grow"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={saveName} 
                      className="bg-black text-white px-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-gray-600 flex items-center"
                    onClick={() => setIsEditing(true)}
                  >
                    {user.name}
                    <button className="mr-2 text-gray-500 hover:text-black" aria-label="تعديل الاسم">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm text-gray-500 mb-1 block">البريد الإلكتروني</Label>
                <p id="email" className="text-gray-800">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification settings */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">إعدادات الإشعارات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-gray-800">إشعارات البريد الإلكتروني</Label>
              <Switch 
                id="email-notifications" 
                checked={user.notifications.email}
                onCheckedChange={() => toggleNotification('email')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="app-notifications" className="text-gray-800">إشعارات التطبيق</Label>
              <Switch 
                id="app-notifications" 
                checked={user.notifications.app}
                onCheckedChange={() => toggleNotification('app')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle" className="text-gray-800">المظهر الداكن</Label>
              <Switch 
                id="theme-toggle" 
                checked={user.theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* About the website */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">نبذة عن الموقع</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 leading-relaxed">
              لماح منصة تعليمية تساعد الطلاب على تلخيص الدروس وإنشاء اختبارات ذكية باستخدام الذكاء الاصطناعي. تهدف منصتنا إلى جعل عملية التعلم أكثر فعالية وتفاعلية من خلال توظيف أحدث تقنيات الذكاء الاصطناعي.
            </p>
          </CardContent>
        </Card>

        {/* Connect with Lammah */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">التواصل مع لماح</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 mb-4">تابع حساباتنا على تويتر:</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Link href="https://twitter.com/lammah_ai" target="_blank" className="w-full">
                <Button className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white flex items-center justify-center gap-2 w-full">
                  <Twitter className="w-5 h-5 text-white" />
                  <span>حساب لماح</span>
                </Button>
              </Link>
              <Link href="https://twitter.com/dev_twitter" target="_blank" className="w-full">
                <Button className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white flex items-center justify-center gap-2 w-full">
                  <Twitter className="w-5 h-5 text-white" />
                  <span>حساب المطور</span>
                </Button>
              </Link>
            </div>
            <a href="mailto:support@lammah.com" className="w-full block">
              <Button variant="outline" className="border border-gray-300 hover:bg-gray-100 text-black flex items-center justify-center gap-2 w-full">
                <Mail className="w-5 h-5" />
                <span>تواصل معنا عبر البريد الإلكتروني</span>
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Additional settings */}
        <Card className="mb-6 w-full max-w-2xl bg-white text-black shadow-lg rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">الإعدادات الإضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <a href="mailto:support@lammah.com" className="w-full">
                <Button variant="outline" className="border border-gray-300 hover:bg-gray-100 text-black flex items-center justify-center gap-2 w-full">
                  <span>الإبلاغ عن مشكلة</span>
                </Button>
              </a>
              <Link href="/privacy-policy" className="w-full">
                <Button variant="outline" className="border border-gray-300 hover:bg-gray-100 text-black flex items-center justify-center gap-2 w-full">
                  <Shield className="w-5 h-5" />
                  <span>سياسة الخصوصية</span>
                </Button>
              </Link>
              
              {/* Logout */}
              <Button 
                onClick={handleLogout}
                className="bg-red-600 text-white shadow-md hover:bg-red-700 w-full py-3 text-lg mt-4 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </Button>
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