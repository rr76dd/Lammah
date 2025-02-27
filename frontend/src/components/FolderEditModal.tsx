import { useState } from "react";

const iconsList = ["📂", "📁", "📑", "🗂️", "📜", "📋", "📝", "📖", "📕", "📗", "📘", "📙", "📔", "📒", "📚", "🔖", "🏷️", "🗄️", "🗃️", "🛠️"];

const FolderEditModal = ({
  folder,
  onSave,
  onClose
}: {
  folder: { id: string; name: string; icon: string; tag: string };
  onSave: (updatedFolder: { id: string; name: string; icon: string; tag: string }) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(folder.name);
  const [icon, setIcon] = useState(folder.icon);
  const [tag, setTag] = useState(folder.tag);

  const handleSave = () => {
    onSave({ id: folder.id, name, icon, tag });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">تعديل المجلد</h2>

        <label className="block mb-2">اسم المجلد:</label>
        <input className="w-full p-2 border rounded mb-3" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="block mb-2">الأيقونة:</label>
<div className="grid grid-cols-5 gap-2 p-2 border rounded mb-3 bg-gray-100">
  {iconsList.map((iconOption) => (
    <button
      key={iconOption}
      className={`p-2 border rounded text-2xl ${icon === iconOption ? "bg-black text-white" : "bg-white"}`}
      onClick={() => setIcon(iconOption)}
    >
      {iconOption}
    </button>
  ))}
</div>


        <label className="block mb-2">التصنيف:</label>
        <input className="w-full p-2 border rounded mb-3" value={tag} onChange={(e) => setTag(e.target.value)} />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">إلغاء</button>
          <button onClick={handleSave} className="px-4 py-2 bg-black text-white rounded">حفظ</button> {/* ✅ تغيير اللون إلى الأسود */}
        </div>
      </div>
    </div>
  );
};

export default FolderEditModal;
