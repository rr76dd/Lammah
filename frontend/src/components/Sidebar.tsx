"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { BookOpenText, MessageSquareText, Settings, Menu, X, PencilRuler} from "lucide-react";

// 🛠️ تعريف الواجهة للرابط الجانبي
interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode; // ✅ استخدام React.ReactNode بدلاً من JSX.Element
}

// ✅ مكون Sidebar
export function Sidebar() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`bg-black text-white z-50 ${
        isMobile 
          ? "fixed top-0 w-full p-4 shadow-md" 
          : "fixed top-0 w-full shadow-xl flex items-center justify-between px-6 py-3"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="font-bold text-xl px-5">لماح</div>
        
        {isMobile ? (
          <button 
            onClick={toggleMenu} 
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        ) : (
          <nav className="flex items-center space-x-6 space-x-reverse">
            <SidebarLink href="/dashboard" label="المكتبة" icon={<BookOpenText size={20} />} />
            <SidebarLink href="/chat" label="المحادثة" icon={<MessageSquareText size={20} />} />
            <SidebarLink href="/tools" label="الأدوات" icon={<PencilRuler  size={20} />} />
            <SidebarLink href="/settings" label="الإعدادات" icon={<Settings size={20} />} />
          </nav>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <nav className="fixed top-16 left-0 right-0 bg-black shadow-xl p-4 space-y-2 z-40 rounded-b-lg">
          <SidebarLink href="/dashboard" label="المكتبة" icon={<BookOpenText size={20} />} />
          <SidebarLink href="/chat" label="المحادثة" icon={<MessageSquareText size={20} />} />
          <SidebarLink href="/tools" label="الأدوات" icon={<PencilRuler  size={20} />} />
          <SidebarLink href="/settings" label="الإعدادات" icon={<Settings size={20} />} />
        </nav>
      )}
    </header>
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