"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard"); // ✅ تحويل مباشر إلى صفحة لوحة التحكم
  }, [router]);

  return null;
}
