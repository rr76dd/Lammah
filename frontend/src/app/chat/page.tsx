"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENROUTER_API_KEY`,
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-72b-instruct:free",
          messages: [
            { role: "system", content: "أنت مساعد ذكي يساعد المستخدم في الإجابة على أسئلته." },
            { role: "user", content: input }
          ]
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setMessages((prev) => [...prev, { role: "ai", text: data.choices[0].message.content }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "لم أتمكن من فهم سؤالك، حاول مرة أخرى!" }]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [...prev, { role: "ai", text: "حدث خطأ أثناء الاتصال، حاول مرة أخرى لاحقًا!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardContent className="space-y-4 p-4 h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`p-2 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
              {msg.text}
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex gap-2 mt-4">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="اكتب رسالة..." 
        />
        <Button onClick={sendMessage} disabled={loading}>
          {loading ? "جاري الإرسال..." : "إرسال"}
        </Button>
      </div>
    </div>
  );
}
