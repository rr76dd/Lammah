"use client";

import React from "react"; // ✅ إضافة هذا السطر لحل المشكلة
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Library, MessageSquare, Settings } from "lucide-react";

// 🛠️ تعريف الواجهة للرابط الجانبي
interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode; // ✅ استخدام React.ReactNode بدلاً من JSX.Element
}

// ✅ مكون Sidebar
export function Sidebar() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={`bg-black text-white p-6 ${
        isMobile ? "fixed bottom-0 w-full flex justify-around py-3" : "w-50 h-screen shadow-xl flex flex-col"
      }`}
    >
      <nav className={`space-y-3 ${isMobile ? "flex space-x-6 justify-center w-full" : ""}`}>
        <SidebarLink href="/dashboard" label="المكتبة" icon={<Library size={20} />} />
        <SidebarLink href="/chat" label="المحادثة" icon={<MessageSquare size={20} />} />
        <SidebarLink href="/settings" label="الإعدادات" icon={<Settings size={20} />} />
      </nav>
    </aside>
  );
}

// ✅ مكون SidebarLink مع تمييز الصفحة المفتوحة
const SidebarLink: React.FC<SidebarLinkProps> = ({ href, label, icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 text-white font-medium rounded-lg transition ${
        isActive ? "bg-gray-700" : "hover:bg-gray-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};