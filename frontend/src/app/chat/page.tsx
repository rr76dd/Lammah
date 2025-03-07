"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send,
  Paperclip,
  File,
  User,
  Bot,
  Clock,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import "@/styles/scrollbar.css";
import { motion, AnimatePresence } from "framer-motion";

// Study-focused conversation starters
const conversationStarters = [
  "هل يمكنك مساعدتي في فهم مفهوم معين؟",
  "كيف أحسن مهارات الكتابة الأكاديمية؟",
  "اشرح لي موضوع الفيزياء الكمية",
  "أحتاج ملخصاً لكتاب دراسي"
];

interface Message {
  id: string;
  sender: "Lammah" | "أنت";
  text: string;
  time: string;
  isLoading?: boolean;
  attachments?: Array<{
    type: "file";
    name: string;
    url?: string;
    size?: string;
  }>;
}

// Mock function for API communication - would be replaced with actual API calls
const fetchAIResponse = async (userMessage: string): Promise<string> => {
  // This would be replaced with an actual API call to your AI model
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  // Academic-focused sample responses
  const responses = {
    default: "يمكنني مساعدتك في أي موضوع دراسي. هل تحتاج إلى شرح، ملخص، أو مساعدة في حل مسألة معينة؟",
    math: "الرياضيات هي أساس العلوم. يمكنني مساعدتك في فهم المفاهيم الأساسية أو حل المسائل المعقدة. ما هو الموضوع المحدد الذي تحتاج مساعدة فيه؟",
    science: "العلوم متنوعة وشيقة! سواء كانت فيزياء، كيمياء، أو بيولوجيا، يمكنني تقديم شروحات مبسطة وأمثلة توضيحية. ما الجزء الذي تجد صعوبة في فهمه؟",
    literature: "الأدب يفتح آفاقاً جديدة للفهم والتحليل. يمكنني مساعدتك في تحليل النصوص، فهم الرموز الأدبية، أو تطوير مهارات الكتابة الإبداعية.",
    history: "التاريخ يعلمنا دروساً قيمة. يمكنني مساعدتك في فهم الأحداث التاريخية، الشخصيات المؤثرة، والتطورات الحضارية عبر العصور.",
    study: "لتحسين مهارات الدراسة، أنصح بتقنية بومودورو: الدراسة لمدة 25 دقيقة ثم أخذ استراحة قصيرة. كما يمكن استخدام الخرائط الذهنية لتنظيم المعلومات."
  };
  
  // Simple keyword matching to provide contextually relevant responses
  if (userMessage.includes("رياض") || userMessage.includes("حساب") || userMessage.includes("معادل")) {
    return responses.math;
  } else if (userMessage.includes("علوم") || userMessage.includes("فيزياء") || userMessage.includes("كيمياء") || userMessage.includes("بيولوجيا")) {
    return responses.science;
  } else if (userMessage.includes("أدب") || userMessage.includes("كتاب") || userMessage.includes("قصة") || userMessage.includes("رواية")) {
    return responses.literature;
  } else if (userMessage.includes("تاريخ") || userMessage.includes("حضارة") || userMessage.includes("حدث")) {
    return responses.history;
  } else if (userMessage.includes("دراسة") || userMessage.includes("مذاكرة") || userMessage.includes("امتحان") || userMessage.includes("اختبار")) {
    return responses.study;
  }
  
  return responses.default;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      sender: "Lammah", 
      text: "مرحبًا، أنا لمّاح - مساعدك الدراسي الذكي. كيف يمكنني مساعدتك في دراستك اليوم؟", 
      time: "10:30 ص" 
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Communicate with AI model and get response
  const getAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const responseText = await fetchAIResponse(userMessage);
      
      const currentTime = new Date().toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: true 
      });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: "Lammah",
        text: responseText,
        time: currentTime
      }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      
      // Fallback response in case of API failure
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: "Lammah",
        text: "عذراً، حدث خطأ في الاتصال. هل يمكنك إعادة المحاولة؟",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const currentTime = new Date().toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true 
    });
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "أنت",
      text: input,
      time: currentTime
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    
    // Get AI response
    getAIResponse(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAttachment = () => {
    setShowAttachMenu(!showAttachMenu);
    setShowQuickResponses(false);
  };

  const handleQuickResponses = () => {
    setShowQuickResponses(!showQuickResponses);
    setShowAttachMenu(false);
  };

  const addQuickResponse = (text: string) => {
    setInput(text);
    setShowQuickResponses(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Format file size
      const sizeInKB = file.size / 1024;
      const formattedSize = sizeInKB < 1024 
        ? `${Math.round(sizeInKB * 10) / 10} KB` 
        : `${Math.round(sizeInKB / 102.4) / 10} MB`;
      
      const currentTime = new Date().toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: true 
      });
      
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "أنت",
        text: "",
        time: currentTime,
        attachments: [{
          type: "file",
          name: file.name,
          size: formattedSize
        }]
      };
      
      setMessages(prev => [...prev, newMessage]);
      setShowAttachMenu(false);
      
      // AI response to file upload
      setTimeout(() => {
        getAIResponse(`تم إرسال ملف: ${file.name}`);
      }, 500);
    }
  };

  // Clear chat history
  const clearChat = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في مسح جميع المحادثات؟")) {
      setMessages([{
        id: Date.now().toString(),
        sender: "Lammah",
        text: "مرحباً بك مجدداً، أنا لمّاح - مساعدك الدراسي الذكي. كيف يمكنني مساعدتك اليوم؟",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      }]);
    }
  };

  // Get avatar based on sender
  const getAvatar = (sender: "Lammah" | "أنت") => {
    return sender === "Lammah" 
      ? <Bot className="h-8 w-8 text-white" /> 
      : <User className="h-8 w-8 text-white" />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Chat Section */}
      <div className="flex flex-col items-center flex-1 w-full">
        {/* Chat Container - Set to 95vh height */}
        <div className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-col h-[95vh]">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">لمّاح - المساعد الدراسي الذكي</h2>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">متصل الآن</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={clearChat}
              >
                <Clock className="h-5 w-5 text-gray-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
          
          {/* Messages - Hide scrollbar with custom class */}
          <div 
            ref={chatContainerRef}
            className="flex-1 bg-gray-50 dark:bg-gray-850 p-4 overflow-y-auto no-scrollbar space-y-4"
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-start gap-3 max-w-3xl", 
                    msg.sender === "أنت" ? "mr-auto" : "ml-auto flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.sender === "Lammah" ? "bg-blue-600" : "bg-gray-900"
                  )}>
                    {getAvatar(msg.sender)}
                  </div>
                  
                  <div className={cn(
                    "flex flex-col gap-1",
                    msg.sender === "أنت" ? "items-start" : "items-end"
                  )}>
                    <div className={cn(
                      "max-w-full",
                      msg.sender === "أنت" ? "text-left" : "text-right"
                    )}>
                      <Card className={cn(
                        "p-0 overflow-hidden",
                        msg.sender === "أنت" 
                          ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          : "bg-blue-600 text-white"
                      )}>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="w-full">
                            {msg.attachments[0].type === "file" && (
                              <div className="p-3 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{msg.attachments[0].name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{msg.attachments[0].size}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {msg.text && (
                          <CardContent className="p-3 break-words">
                            <p className="whitespace-pre-line">{msg.text}</p>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                    
                    <div className={cn(
                      "flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400",
                      msg.sender === "أنت" ? "justify-start" : "justify-end"
                    )}>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 ml-auto flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  
                  <Card className="bg-blue-600 p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </Card>
                </motion.div>
              )}
              
              {/* Invisible element for auto-scroll */}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>
          
          {/* Input Area with conversation starters above input field */}
          <div className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700 rounded-b-xl shadow-sm">
            {/* Conversation starters above input field */}
            <div className="mb-3 flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
              {conversationStarters.map((text, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto py-1 text-xs whitespace-nowrap"
                  onClick={() => {
                    setInput(text);
                    sendMessage();
                  }}
                >
                  {text}
                </Button>
              ))}
            </div>
            
            <div className="relative">
              {/* Attachment menu */}
              {showAttachMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 p-2 w-48">
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm h-9"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <File className="h-4 w-4" />
                    <span>إرسال ملف</span>
                  </Button>
                </div>
              )}
              
              {/* Show quick responses */}
              {showQuickResponses && (
                <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 p-2 flex flex-col w-64">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                    المواضيع الدراسية
                  </div>
                  {["ساعدني في الرياضيات", "اشرح مفهوم في الفيزياء", "قدم نصائح للمذاكرة", "لخص موضوع أدبي"].map((text) => (
                    <Button
                      key={text}
                      variant="ghost"
                      className="justify-start text-xs h-8"
                      onClick={() => addQuickResponse(text)}
                    >
                      {text}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-850 rounded-xl px-3 py-1 border dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    onClick={handleAttachment}
                  >
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
                
                <Input
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-right px-3 py-2"
                  dir="rtl"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك أو استفسارك الدراسي..."
                />
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-9 w-9 rounded-full transition",
                      input.trim() ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-400"
                    )}
                    onClick={sendMessage}
                    disabled={!input.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    onClick={handleQuickResponses}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                مدعوم بواسطة <span className="font-medium text-gray-800 dark:text-gray-200">Claude 3.7 Sonnet</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}