"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import "@/styles/scrollbar.css";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

interface Message {
  sender: string;
  text: string;
  time: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    const userMessage: Message = { sender: "أنت", text: input, time: currentTime };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, { 
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        credentials: "omit", // ⬅️ مهم لمنع مشاكل CORS في Brave
        body: JSON.stringify({ message: input }) 
    });
    
    
      

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      const aiMessage: Message = {
        sender: "لماح",
        text: data.response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        sender: "لماح",
        text: "عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 flex-col md:flex-row pt-20">
      <Sidebar />
      
      <div className="flex flex-col items-center justify-center flex-1 px-2 w-full max-w-4xl mx-auto pb-20">
        <header className="w-full text-center py-3">
          <span className="text-xs text-gray-500 dark:text-gray-400"> مدعوم بواسطة <span className="text-black dark:text-white"> Claude 3.7 Sonnet </span></span>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mt-2">أنا لماح, كيف أقدر أساعدك ؟</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">اسألني عن أي شيء.</p>
        </header>

        <div className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col h-[75vh] overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 pb-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <Card
                key={index}
                className={cn(
                  "p-1 break-words max-w-full sm:max-w-[75%] relative w-fit", 
                  msg.sender === "أنت" 
                    ? "ml-auto bg-black text-white text-right"
                    : "mr-auto bg-gray-100 text-gray-900 text-left"
                )}
              >
                <CardContent>
                  <p>{msg.text}</p>
                  <span className={cn("text-xs text-gray-500 absolute bottom-1", msg.sender === "أنت" ? "start-2" : "end-2")}>{msg.time}</span>
                </CardContent>
              </Card>
            ))}
            {isLoading && (
              <Card className="mr-auto bg-gray-100 text-gray-900 text-left p-3 break-words max-w-full sm:max-w-[75%] relative w-fit">
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-center border-t pt-4 gap-2">
            <Input
              className="flex-1 border rounded-lg px-3 py-2 text-right"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك..."
              disabled={isLoading}
            />
            <Button onClick={sendMessage} variant="default" disabled={isLoading}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}