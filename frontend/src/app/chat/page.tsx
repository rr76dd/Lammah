"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import "@/styles/scrollbar.css";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "NOVA", text: "مرحبًا جيسيكا، كيف يمكنني مساعدتك اليوم؟", time: "10:30 ص" },
    { sender: "أنت", text: "مرحبًا نوفا، لدي مشكلة في طلبي.", time: "10:31 ص" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    setMessages([...messages, { sender: "أنت", text: input, time: currentTime }]);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Chat Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 w-full max-w-2xl mx-auto">
        {/* Header */}
        <header className="w-full text-center py-6">
          <span className="text-xs text-gray-500 dark:text-gray-400"> مدعوم بواسطة <span className="text-black dark:text-white"> Claude 3.7 Sonnet </span></span>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">أنا لماح, كيف أقدر أساعدك ؟</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">اسألني عن شيء، أو أرفق ملفات.</p>
        </header>

        {/* Chat Container */}
        <div className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col h-[600px] overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 pb-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <Card
                key={index}
                className={cn(
                  "p-3 break-words max-w-full sm:max-w-[75%] relative w-fit", 
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
          </div>

          {/* Message Input */}
          <div className="flex items-center border-t pt-4 gap-2">
            <Button variant="ghost">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              className="flex-1 border rounded-lg px-3 py-2 text-right"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك..."
            />
            <Button onClick={sendMessage} variant="default">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
