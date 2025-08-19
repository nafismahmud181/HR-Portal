import React from "react";
import {
  LayoutDashboard,
  Shapes,
  Type,
  BadgeCheck,
  UploadCloud,
  Wrench,
  Folder,
  AppWindow,
  Sparkles,
  ListPlus,
  StickyNote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PortalRightSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onBulkCreate: () => void;
}

const items = [
  { id: "design", label: "Design", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "elements", label: "Elements", icon: <Shapes className="w-5 h-5" /> },
  { id: "text", label: "Text", icon: <Type className="w-5 h-5" /> },
  { id: "brand", label: "Brand", icon: <BadgeCheck className="w-5 h-5" /> },
  { id: "uploads", label: "Uploads", icon: <UploadCloud className="w-5 h-5" /> },
  { id: "tools", label: "Tools", icon: <Wrench className="w-5 h-5" /> },
  { id: "projects", label: "Projects", icon: <Folder className="w-5 h-5" /> },
  { id: "apps", label: "Apps", icon: <AppWindow className="w-5 h-5" /> },
  { id: "magic", label: "Magic Media", icon: <Sparkles className="w-5 h-5" /> },
  { id: "bulk", label: "Bulk create", icon: <ListPlus className="w-5 h-5" /> },
];

const PortalRightSidebar: React.FC<PortalRightSidebarProps> = ({ collapsed, onToggle, onBulkCreate }) => {
  return (
    <aside
      className={`fixed right-0 top-0 bottom-0 border-l border-gray-200 bg-white z-40 transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col items-stretch space-y-2 px-2">
            {items.map((item) => (
              <button
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 text-sm text-left"
                onClick={item.id === "bulk" ? onBulkCreate : undefined}
              >
                <span className="flex items-center justify-center w-6">{item.icon}</span>
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-2 pb-3">
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700"
            onClick={onToggle}
          >
            <span className="flex items-center gap-3">
              <StickyNote className="w-5 h-5" />
              {!collapsed && <span>Notes</span>}
            </span>
            {collapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PortalRightSidebar;


