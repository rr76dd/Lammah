"use client";

import { Sidebar } from "@/components/Sidebar";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import SortableFolder from "@/components/SortableFolder";
import FolderEditModal from "@/components/FolderEditModal";

interface Folder {
  id: string;
  name: string;
  icon: string;
  tag: string;
  files: File[];
}

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // ✅ إنشاء مجلد جديد
  const handleCreateFolder = (name: string, icon: string, tag: string) => {
    const newFolder: Folder = { id: crypto.randomUUID(), name, icon, tag, files: [] };
    setFolders([...folders, newFolder]);
  };

  // ✅ تعديل المجلد
  const handleEditFolder = (updatedFolder: { id: string; name: string; icon: string; tag: string }) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === updatedFolder.id ? { ...folder, ...updatedFolder, files: folder.files } : folder
      )
    );
    setEditingFolder(null);
  };

  // ✅ حذف المجلد المحدد
  const handleDeleteFolder = (id: string) => {
    const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا المجلد؟");
    if (confirmDelete) {
      setFolders(folders.filter((folder) => folder.id !== id));
    }
  };

  // ✅ تفعيل مستشعرات السحب والإفلات
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ✅ تحديث ترتيب العناصر عند السحب
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    const oldIndex = folders.findIndex((folder) => folder.id === active.id);
    const newIndex = folders.findIndex((folder) => folder.id === over.id);
    setFolders((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white text-black">
      {/* ✅ شريط التنقل الجانبي */}
      <Sidebar />

      {/* ✅ المحتوى الرئيسي */}
      <main className="flex-1 p-4 pt-20 flex flex-col items-center">
        <div className="w-full max-w-sm sm:max-w-4xl">
          {/* ✅ عنوان الصفحة وأزرار التحكم */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
              📚 المكتبة
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <CreateFolderModal onCreate={handleCreateFolder} />

              {/* ✅ زر رفع الملفات */}
              <input type="file" id="fileUpload" className="hidden" />
              <button
                onClick={() => document.getElementById("fileUpload")?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition w-full sm:w-auto"
              >
                📤 رفع ملف
              </button>
            </div>
          </div>

          {/* ✅ قائمة المجلدات مع السحب والإفلات */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={folders.map((folder) => folder.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
                {folders.length > 0 ? (
                  folders.map((folder) => (
                    <SortableFolder
                      key={folder.id}
                      folder={folder}
                      onSelect={(id) => console.log(`Selected folder: ${id}`)}
                      onEdit={() => setEditingFolder(folder)}
                      onDelete={handleDeleteFolder}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center col-span-2 mt-4">
                    📂 لا توجد مجلدات حاليًا، ابدأ بإنشاء مجلد جديد!
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </main>

      {/* ✅ نافذة تعديل المجلد */}
      {editingFolder && (
        <FolderEditModal
          folder={editingFolder}
          onSave={handleEditFolder}
          onClose={() => setEditingFolder(null)}
        />
      )}
    </div>
  );
}
