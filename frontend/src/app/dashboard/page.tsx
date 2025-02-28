"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import { Sidebar } from "@/components/Sidebar";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import SortableFolder from "@/components/SortableFolder";
import FolderEditModal from "@/components/FolderEditModal";

/* 📌 تعريف الواجهات */
interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  tag: string;
  files: FileData[];
}

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]); // ✅ قائمة المجلدات
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null); // ✅ مجلد التعديل
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // ✅ تصنيف المجلدات
  const router = useRouter();

  /* ✅ فتح المجلد عند النقر عليه */
  const handleOpenFolder = (id: string) => {
    router.push(`/dashboard/folder/${id}`);
  };

  /* ✅ إنشاء مجلد جديد */
  const handleCreateFolder = (name: string, icon: string, tag: string) => {
    const newFolder: Folder = { id: uuidv4(), name, icon, tag, files: [] };
    setFolders([...folders, newFolder]);
  };

  /* ✅ تعديل المجلد */
  const handleEditFolder = (updatedFolder: Folder) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === updatedFolder.id ? { ...folder, ...updatedFolder } : folder
      )
    );
    setEditingFolder(null);
  };

  /* ✅ حذف المجلد */
  const handleDeleteFolder = (id: string) => {
    const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا المجلد؟");
    if (confirmDelete) {
      setFolders((prev) => prev.filter((folder) => folder.id !== id));
    }
  };

  /* ✅ رفع الملفات وإضافتها إلى آخر مجلد تم إنشاؤه */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile: FileData = {
      id: uuidv4(),
      name: files[0].name,
      size: files[0].size,
      type: files[0].type,
    };

    setFolders((prev) =>
      prev.length > 0
        ? prev.map((folder, index) =>
            index === prev.length - 1 ? { ...folder, files: [...folder.files, uploadedFile] } : folder
          )
        : prev
    );
  };

  /* ✅ استخراج التصنيفات الفريدة */
  const tags = Array.from(new Set(folders.map((folder) => folder.tag))).filter((tag) => tag);

  /* ✅ تصفية المجلدات حسب التصنيف المحدد */
  const filteredFolders = selectedTag ? folders.filter((folder) => folder.tag === selectedTag) : folders;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white text-black">
      {/* ✅ الشريط الجانبي */}
      <Sidebar />

      {/* ✅ المحتوى الرئيسي */}
      <main className="flex-1 p-4 pt-10 flex flex-col items-center">
        <div className="w-full max-w-sm sm:max-w-4xl">
          
          {/* ✅ الشريط العلوي */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">📚 المكتبة</h1>
            
            {/* ✅ إنشاء مجلد ورفع الملفات */}
            <div className="flex flex-row gap-4">
              <CreateFolderModal onCreate={handleCreateFolder} />
              <input type="file" id="fileUpload" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => document.getElementById("fileUpload")?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition"
              >
                📤 رفع ملف
              </button>
            </div>
          </div>

          {/* ✅ شريط التصنيفات */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  selectedTag === null ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedTag(null)}
              >
                عرض الكل
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    selectedTag === tag ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* ✅ عرض المجلدات */}
          {filteredFolders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
              {filteredFolders.map((folder) => (
                <SortableFolder 
                  key={folder.id} 
                  folder={folder} 
                  onEdit={() => setEditingFolder(folder)}
                  onDelete={() => handleDeleteFolder(folder.id)}
                  onSelect={() => handleOpenFolder(folder.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <p className="text-gray-500 text-xl font-bold text-center">
                لا يوجد محتوى هنا بعد! حمّل ملفاتك الآن أو أنشئ مجلدًا جديدًا لتنظيمها 📂.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ✅ نافذة تعديل المجلد */}
      {editingFolder && (
        <FolderEditModal folder={editingFolder} onSave={handleEditFolder} onClose={() => setEditingFolder(null)} />
      )}
    </div>
  );
}