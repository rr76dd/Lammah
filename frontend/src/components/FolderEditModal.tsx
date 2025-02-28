import { useState, useEffect } from "react";

/* 📌 قائمة الأيقونات المتاحة */
const iconsList = [
  "📂", "📁", "📑", "🗂️", "📜", "📋", "📝", "📖",
  "📕", "📗", "📘", "📙", "📔", "📒", "📚", "🔖",
  "🏷️", "🗄️", "🗃️", "🛠️"
];

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
  files: FileData[]; // ✅ إصلاح الخطأ بإضافة `files`
}

interface FolderEditModalProps {
  folder: Folder;
  onSave?: (updatedFolder: Folder) => void;
  onClose?: () => void;
}

/* 📌 مكون نافذة تعديل المجلد */
const FolderEditModal: React.FC<FolderEditModalProps> = ({ folder, onSave, onClose }) => {
  /* 📌 إدارة الحالة لبيانات المجلد */
  const [name, setName] = useState(folder.name);
  const [icon, setIcon] = useState(folder.icon);
  const [tag, setTag] = useState(folder.tag);

  // ✅ تحديث القيم عند تغيير `folder`
  useEffect(() => {
    setName(folder.name);
    setIcon(folder.icon);
    setTag(folder.tag);
  }, [folder]);

  /* 📌 حفظ التعديلات */
  const handleSave = () => {
    if (typeof onSave === "function") {
      onSave({ 
        id: folder.id, 
        name, 
        icon, 
        tag, 
        files: folder.files || [] // ✅ التأكد من الحفاظ على الملفات عند التعديل
      });
    } else {
      console.warn("⚠️ تحذير: onSave لم يتم تمريره أو ليس دالة!");
    }

    if (typeof onClose === "function") {
      onClose();
    } else {
      console.warn("⚠️ تحذير: onClose لم يتم تمريره أو ليس دالة!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">تعديل المجلد</h2>

        {/* 📌 إدخال اسم المجلد */}
        <label className="block mb-2">اسم المجلد:</label>
        <input
          className="w-full p-2 border rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* 📌 اختيار الأيقونة */}
        <label className="block mb-2">الأيقونة:</label>
        <div className="grid grid-cols-5 gap-2 p-2 border rounded mb-3 bg-gray-100">
          {iconsList.map((iconOption) => (
            <button
              key={iconOption}
              className={`p-2 border rounded text-2xl ${
                icon === iconOption ? "bg-black text-white" : "bg-white"
              }`}
              onClick={() => setIcon(iconOption)}
            >
              {iconOption}
            </button>
          ))}
        </div>

        {/* 📌 إدخال التصنيف */}
        <label className="block mb-2">التصنيف:</label>
        <input
          className="w-full p-2 border rounded mb-3"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />

        {/* 📌 أزرار التحكم */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
            إلغاء
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-black text-white rounded">
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderEditModal;
