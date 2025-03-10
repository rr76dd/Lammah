"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/app/globals.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard"); // ✅ تحويل مباشر إلى صفحة لوحة التحكم
  }, [router]);

  return null;
}
