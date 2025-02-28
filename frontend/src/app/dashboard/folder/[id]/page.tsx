'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, ClipboardList, BookOpen, Pencil } from 'lucide-react';
import Link from 'next/link';

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

export default function FolderPage() {
  const params = useParams();
  const folderId = params?.id as string;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFile, setEditingFile] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!folderId) {
      console.warn("⚠️ `folderId` غير متوفر.");
      setIsLoading(false);
      return;
    }

    const storedFolders = JSON.parse(localStorage.getItem('folders') || '[]');
    console.log("📂 المخزنة في localStorage:", storedFolders);
    console.log("📁 البحث عن المجلد باستخدام folderId:", folderId);

    const currentFolder = storedFolders.find((f: Folder) => f.id === folderId);

    if (!currentFolder) {
      console.warn("⚠️ لم يتم العثور على المجلد!");
      setIsLoading(false);
      return;
    }

    setFolder(currentFolder);
    setFiles(currentFolder.files);
    setIsLoading(false);
  }, [folderId]);

  // ✅ رفع ملف جديد
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (!newFiles || newFiles.length === 0) return;

    const uploadedFile: FileData = {
      id: String(Date.now()),
      name: newFiles[0].name,
      size: newFiles[0].size,
      type: newFiles[0].type,
    };

    const updatedFiles = [...files, uploadedFile];
    setFiles(updatedFiles);
    updateFolderData(updatedFiles);
  };

  // ✅ تحديث بيانات المجلد عند رفع الملفات
  const updateFolderData = (updatedFiles: FileData[]) => {
    if (!folder) return;
    const storedFolders = JSON.parse(localStorage.getItem('folders') || '[]');
    const updatedFolders = storedFolders.map((f: Folder) =>
      f.id === folder.id ? { ...f, files: updatedFiles } : f
    );

    localStorage.setItem('folders', JSON.stringify(updatedFolders));
  };

  // ✅ تغيير اسم الملف
  const handleRenameFile = (fileId: string, newName: string) => {
    const updatedFiles = files.map((file) =>
      file.id === fileId ? { ...file, name: newName } : file
    );
    setFiles(updatedFiles);
    updateFolderData(updatedFiles);
    setEditingFile(null);
  };

  // ✅ إظهار رسالة تحميل أثناء استرجاع البيانات
  if (isLoading) {
    return <p className="text-center text-gray-500">⏳ تحميل البيانات...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      {folder ? (
        <div>
          {/* ✅ معلومات المجلد */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {folder.icon} {folder.name}
              </h1>
              <p className="text-gray-500">📌 التصنيف: {folder.tag}</p>
              <p className="text-gray-500">📂 عدد الملفات: {files.length}</p>
            </div>

            {/* ✅ زر رفع الملفات */}
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              <Button>
                <Upload className="mr-2" /> رفع ملف
              </Button>
            </label>
          </div>

          {/* ✅ قائمة الملفات */}
          {files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="p-4">
                  <CardHeader>
                    {editingFile?.id === file.id ? (
                      <Input
                        value={editingFile.name}
                        onChange={(e) =>
                          setEditingFile({ id: file.id, name: e.target.value })
                        }
                        onBlur={() =>
                          handleRenameFile(editingFile.id, editingFile.name)
                        }
                        autoFocus
                      />
                    ) : (
                      <CardTitle className="flex justify-between items-center">
                        <span>{file.name}</span>
                        <Pencil
                          className="cursor-pointer text-gray-500 hover:text-black"
                          onClick={() => setEditingFile({ id: file.id, name: file.name })}
                        />
                      </CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Button variant="outline">
                      <FileText className="mr-2" /> إنشاء ملخص
                    </Button>
                    <Button variant="outline">
                      <ClipboardList className="mr-2" /> إنشاء اختبار
                    </Button>
                    <Button variant="outline">
                      <BookOpen className="mr-2" /> إنشاء بطاقات تعليمية
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">📂 لا توجد ملفات بعد!</p>
          )}
        </div>
      ) : (
        // ✅ عرض رسالة في حال لم يتم العثور على المجلد
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <p className="text-red-500 text-xl font-bold">⚠️ لم يتم العثور على هذا المجلد!</p>
          <p className="text-gray-500 mt-2">
            قد يكون المجلد محذوفًا أو لم يتم إنشاؤه بعد.
          </p>
          <Link href="/dashboard">
            <Button className="mt-4 bg-black text-white px-4 py-2 rounded-md">
              ⬅ العودة إلى الصفحة الرئيسية
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
