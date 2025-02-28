import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, Portal } from "@radix-ui/react-popover";

interface Folder {
  id: string;
  name: string;
  icon: string;
  tag: string;
}

export default function SortableFolder({
  folder,
  onEdit,
  onDelete,
  onSelect
}: {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
  });

  /* ✅ إدارة ظهور القائمة */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ✅ عند الضغط على زر `...`، افتح القائمة */
  const handleMenuToggle = (event: React.MouseEvent) => {
    event.stopPropagation(); // ⛔ منع تنفيذ `onSelect`
    event.preventDefault();  // ⛔ منع أي تصرف افتراضي
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? "0 5px 15px rgba(0, 0, 0, 0.15)" : "none",
        scale: isDragging ? 1.03 : 1,
        zIndex: isDragging ? 1000 : "auto",
      }}
      {...attributes}
      {...listeners}
      className="relative p-5 rounded-lg shadow-md bg-gray-200 border border-gray-300 flex items-center justify-between w-full cursor-pointer hover:bg-gray-300 transition-all overflow-visible"
      onClick={() => onSelect(folder.id)}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{folder.icon}</span>
        <h3 className="text-lg font-semibold">{folder.name}</h3>
      </div>

      {/* ✅ زر القائمة المنبثقة مع التحكم اليدوي في `useState` */}
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger asChild>
          <button 
            className="p-2 rounded-full hover:bg-gray-300 transition"
            onClick={handleMenuToggle} // ✅ السماح بفتح القائمة
          >
            <MoreVertical size={20} />
          </button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            align="start"
            side="right"
            sideOffset={5}
            className="bg-white shadow-lg rounded-lg w-40 p-2 border border-gray-200 z-50 max-w-[calc(100vw-20px)]"
            onClick={(e) => e.stopPropagation()} // ✅ منع إغلاق القائمة فورًا
          >
            <div>
              <button
                onClick={() => {
                  setIsMenuOpen(false); // ✅ إغلاق القائمة بعد النقر
                  onEdit(folder);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md"
              >
                <Edit size={16} /> تعديل المجلد
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false); // ✅ إغلاق القائمة بعد النقر
                  onDelete(folder.id);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-100 rounded-md"
              >
                <Trash2 size={16} /> حذف المجلد
              </button>
            </div>
          </PopoverContent>
        </Portal>
      </Popover>
    </div>
  );
}
