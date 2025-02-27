import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

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

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ✅ إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? "0 5px 15px rgba(0, 0, 0, 0.15)" : "none",
        scale: isDragging ? 1.03 : 1,
      }}
      {...attributes}
      {...listeners}
      className="relative p-5 rounded-lg shadow-md bg-gray-200 border border-gray-300 flex items-center justify-between w-full cursor-pointer hover:bg-gray-300 transition-all"
      onClick={() => onSelect(folder.id)}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{folder.icon}</span>
        <h3 className="text-lg font-semibold">{folder.name}</h3>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-300 transition"
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg w-40 p-2 z-50">
            <button
              onClick={() => {
                onEdit(folder);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md"
            >
              <Edit size={16} /> تعديل المجلد
            </button>
            <button
              onClick={() => onDelete(folder.id)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 hover:bg-gray-100 rounded-md"
            >
              <Trash2 size={16} /> حذف المجلد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
