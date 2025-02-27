"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FolderPlus } from "lucide-react";

// قائمة الأيقونات المتاحة
const folderIcons = [
  "📘", "📕", "📗", "📙", "📂", "📁", "💻", "📝", "📊", "⚙️",
  "📜", "📒", "📖", "🧪", "🎵", "🎨", "🧬", "📡", "🧑‍🔬", "🔬"
];

interface CreateFolderModalProps {
  onCreate: (name: string, icon: string, tag: string) => void;
}

export function CreateFolderModal({ onCreate }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(folderIcons[0]);
  const [customTag, setCustomTag] = useState(""); // ✅ تصنيف مخصص
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (folderName.trim() === "" || customTag.trim() === "") return; // ✅ التأكد من أن التصنيف ليس فارغًا
    onCreate(folderName, selectedIcon, customTag);
    setFolderName("");
    setCustomTag("");
    setOpen(false); // ✅ إغلاق النافذة بعد الإنشاء
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition">
          <FolderPlus size={20} />
          إنشاء مجلد
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold flex items-center gap-2">
                📁 إنشاء مجلد جديد
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* إدخال اسم المجلد */}
            <input
              type="text"
              placeholder="اسم المجلد..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* اختيار الأيقونة */}
            <h3 className="mt-4 mb-2 text-sm font-semibold">اختر أيقونة:</h3>
            <div className="grid grid-cols-5 gap-2">
              {folderIcons.map((icon) => (
                <button
                  key={icon}
                  className={`p-2 text-2xl border rounded-lg ${
                    selectedIcon === icon ? "bg-gray-200 border-black" : "border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* إدخال التصنيف */}
            <h3 className="mt-4 mb-2 text-sm font-semibold">اختر تصنيفًا خاصًا:</h3>
            <input
              type="text"
              placeholder="مثال: برمجة، رياضيات، فيزياء..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* زر الإنشاء */}
            <button
              onClick={handleCreate}
              className="mt-4 w-full bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition"
            >
              إنشاء المجلد
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
