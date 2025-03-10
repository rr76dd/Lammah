"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/utils/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface FileData {
  id: string;
  name: string;
  file_name?: string;
  size: number;
  type: string;
  url: string;
  folderName?: string;
  folder_name?: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
}

const FileCard = ({ file, onDelete }: { file: FileData; onDelete: (id: string, path: string) => void }) => {
  const fileName = file.file_name || file.name;
  const router = useRouter();
  
  const getFileIcon = (type: string | undefined) => {
    if (!type) return "📁";
    
    if (type.includes("pdf")) return "📄";
    if (type.includes("document") || type.includes("word")) return "📝";
    if (type.includes("google-apps.document")) return "📃";
    return "📁";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => router.push(`/files/${file.id}`)}
      className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 cursor-pointer relative group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-800 truncate">{fileName}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {(file.file_size || file.size) / 1024 < 1024
              ? `${((file.file_size || file.size) / 1024).toFixed(1)} KB`
              : `${((file.file_size || file.size) / (1024 * 1024)).toFixed(1)} MB`}
          </p>
        </div>
        <span className="text-3xl">{getFileIcon(file.file_type || file.type)}</span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          const fileName = file.file_name || file.name;
          const safePath = `${file.folder_name}/${file.id}-${fileName}`;
          onDelete(file.id, safePath);
        }}
        className="absolute top-2 right-2 p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
  );
};

export default function Dashboard() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
  
  useEffect(() => {
    updateFiles();
  }, []);

  const updateFiles = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase.from("uploaded_files").select("*").order('uploaded_at', { ascending: false });
      if (error) {
        console.error("❌ خطأ في جلب الملفات:", error.message);
      } else {
        setFiles(Array.isArray(data) ? [...data] : []);
      }
    } catch (err) {
      console.error("حدث خطأ غير متوقع:", err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.google-apps.document'
  ];
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
  
    const filesArray = Array.from(event.target.files);
    setLoading(true);
    setUploadProgress(0);
  
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) {
        console.error("❌ فشل في جلب بيانات المستخدم:", authError?.message);
        alert("❌ يجب تسجيل الدخول قبل رفع الملفات.");
        setLoading(false);
        setUploadProgress(null);
        return;
      }
  
      const userId = userData.user.id;
      const uploadedFiles: FileData[] = [];
      const totalFiles = filesArray.length;
      let completedFiles = 0;
  
      for (const file of filesArray) {
        const fileId = uuidv4();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const sanitizedFolderName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
        const filePath = `${sanitizedFolderName}/${fileId}-${sanitizedFileName}`;
  
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            metadata: { user_id: userId },
          });
  
        if (uploadError) {
          console.error("❌ خطأ في رفع الملف:", uploadError.message);
          alert(`❌ فشل في رفع الملف: ${file.name}`);
          continue;
        }
  
        const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
        
        if (!data || !data.publicUrl) {
          console.error("❌ فشل في جلب رابط الملف.");
          continue;
        }
  
        const fileUrl = data.publicUrl;
  
        const uploadedFile: FileData = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          folderName: file.name.split(".")[0],
        };
  
        const { error: dbError } = await supabase.from("uploaded_files").insert({
          id: fileId,
          file_name: file.name,
          file_url: fileUrl,            
          file_type: file.type,         
          file_size: file.size,              
          folder_name: file.name.split(".")[0],
          user_id: userId,              
          uploaded_at: new Date().toISOString(), 
        });
  
        if (dbError) {
          console.error("❌ خطأ في إدخال بيانات الملف في قاعدة البيانات:", dbError.message);
          continue;
        }
  
        uploadedFiles.push(uploadedFile);
        completedFiles++;
        setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
      }
  
      if (uploadedFiles.length > 0) {
        setFiles((prevFiles) => [...uploadedFiles, ...prevFiles]);
        const firstUploadedFile = uploadedFiles[0];
        router.push(`/files/${firstUploadedFile.id}`);
      }
    } catch (error) {
      console.error("❌ حدث خطأ غير متوقع:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(null), 1500);
    }
  };
  
  const handleDeleteFile = async (fileId: string, filePath: string) => {
  if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الملف؟")) return;
  
  setLoading(true);
  
  try {
    if (!fileId || !filePath) {
      alert("❌ معرف الملف أو المسار غير صالح");
      setLoading(false);
      return;
    }
  
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      alert("❌ يجب تسجيل الدخول قبل حذف الملفات.");
      setLoading(false);
      return;
    }
  
    const { data: fileData, error: fileError } = await supabase
      .from("uploaded_files")
      .select("user_id")
      .eq("id", fileId)
      .single();
  
    if (fileError || !fileData) {
      alert("❌ لم يتم العثور على الملف.");
      setLoading(false);
      return;
    }
  
    if (fileData.user_id !== userData.user.id) {
      alert("❌ ليس لديك صلاحية لحذف هذا الملف.");
      setLoading(false);
      return;
    }
  
    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove([filePath]);
  
    if (storageError) {
      console.error("❌ خطأ في حذف الملف من التخزين:", storageError.message);
      alert("❌ فشل في حذف الملف من التخزين.");
      setLoading(false);
      return;
    }
  
    const { error: dbError } = await supabase
      .from("uploaded_files")
      .delete()
      .match({ id: fileId, user_id: userData.user.id });
  
    if (dbError) {
      console.error("❌ فشل في حذف سجل الملف:", dbError.message);
      alert("❌ فشل في حذف الملف من قاعدة البيانات.");
      setLoading(false);
      return;
    }
  
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    alert("✅ تم حذف الملف بنجاح.");
  
  } catch (error) {
    console.error("❌ حدث خطأ غير متوقع أثناء حذف الملف", error);
    alert("❌ حدث خطأ غير متوقع أثناء حذف الملف. الرجاء المحاولة مرة أخرى.");
  } finally {
    setLoading(false);
    updateFiles();
  }
};

  const filteredFiles = searchTerm.trim() === '' 
    ? files 
    : files.filter(file => 
        (file.file_name || file.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.folder_name || file.folderName)?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden pt-20" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-sm rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">مكتبة الملفات</h1>
                <p className="text-gray-500 mt-1">إدارة وتنظيم جميع ملفاتك</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن ملف..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
                
                <div className="relative w-full sm:w-auto">
                  <input 
                    type="file" 
                    id="fileUpload" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    multiple 
                  />
                  <button
                    onClick={() => document.getElementById("fileUpload")?.click()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white font-medium rounded-lg shadow-sm hover:bg-gray-700 transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جارٍ الرفع...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        رفع ملفات
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {uploadProgress !== null && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{uploadProgress}% مكتمل</p>
              </div>
            )}
          </div>
          
          {/* قائمة الملفات */}
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file} onDelete={handleDeleteFile} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-black rounded-full text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-700">لا توجد ملفات حالياً</h2>
              <p className="text-gray-500 mt-2 mb-6">اضغط على زر رفع ملفات لإضافة ملفاتك الجديدة</p>
              <button
                onClick={() => document.getElementById("fileUpload")?.click()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white font-medium rounded-lg shadow-sm hover:bg-gray-700 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                رفع ملفات
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}