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
      <Sidebar />

      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">المكتبة</h1>
            <div className="flex gap-3">
              <CreateFolderModal onCreate={handleCreateFolder} />
                {/* ✅ زر رفع الملفات */}
                <input type="file" id="fileUpload" className="hidden" />
                 <button
                  onClick={() => document.getElementById("fileUpload")?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition"
                >
                  📤 رفع ملف
                </button>
              </div>
            </div>


          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={folders.map((folder) => folder.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
                {folders.map((folder) => (
                  <SortableFolder
                    key={folder.id}
                    folder={folder}
                    onSelect={(id) => console.log(`Selected folder: ${id}`)} // ✅ أضف `onSelect` هنا
                    onEdit={() => setEditingFolder(folder)}
                    onDelete={handleDeleteFolder}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </main>

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
