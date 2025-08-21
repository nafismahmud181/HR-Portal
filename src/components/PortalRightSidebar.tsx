import React, { useState } from "react";
import {
  LayoutDashboard,
  Shapes,
  Type,
  BadgeCheck,
  UploadCloud,
  Wrench,
  Folder,
  Sparkles,
  ListPlus,
  ChevronLeft,
  ChevronRight,
  Image,
  Download,
  Share2,
  Layers,
  Grid3X3,
  FileText,
  Clock,
  Zap,

  Lightbulb,
  Rocket,
  CheckCircle,
} from "lucide-react";

interface PortalRightSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onBulkCreate: () => void;
}

interface ToolSection {
  id: string;
  title: string;
  icon: React.ReactElement;
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactElement;
    description?: string;
    badge?: string;
    action?: () => void;
  }>;
}

const PortalRightSidebar: React.FC<PortalRightSidebarProps> = ({ 
  collapsed, 
  onToggle, 
  onBulkCreate 
}) => {
  const [activeSection, setActiveSection] = useState<string>("design");
  const [showNotes, setShowNotes] = useState(false);

  const toolSections: ToolSection[] = [
    {
      id: "design",
      title: "Design Tools",
      icon: <LayoutDashboard className="w-5 h-5" />,
      items: [
        {
          id: "layout",
          label: "Layout",
          icon: <Grid3X3 className="w-4 h-4" />,
          description: "Adjust document layout and spacing"
        },
        {
          id: "elements",
          label: "Elements",
          icon: <Shapes className="w-4 h-4" />,
          description: "Add shapes, lines, and visual elements"
        },
        {
          id: "typography",
          label: "Typography",
          icon: <Type className="w-4 h-4" />,
          description: "Customize fonts and text styling"
        },
        {
          id: "branding",
          label: "Branding",
          icon: <BadgeCheck className="w-4 h-4" />,
          description: "Apply company branding and colors"
        }
      ]
    },
    {
      id: "media",
      title: "Media & Assets",
      icon: <Image className="w-5 h-5" />,
      items: [
        {
          id: "uploads",
          label: "Uploads",
          icon: <UploadCloud className="w-4 h-4" />,
          description: "Manage uploaded images and files",
          badge: "New"
        },
        {
          id: "backgrounds",
          label: "Backgrounds",
          icon: <Layers className="w-4 h-4" />,
          description: "Choose document backgrounds"
        },
        {
          id: "signatures",
          label: "Signatures",
          icon: <FileText className="w-4 h-4" />,
          description: "Add digital signatures"
        }
      ]
    },
    {
      id: "automation",
      title: "Automation",
      icon: <Zap className="w-5 h-5" />,
      items: [
        {
          id: "bulk",
          label: "Bulk Create",
          icon: <ListPlus className="w-4 h-4" />,
          description: "Generate multiple documents at once",
          badge: "Popular",
          action: onBulkCreate
        },
        {
          id: "templates",
          label: "Templates",
          icon: <Folder className="w-4 h-4" />,
          description: "Save and reuse document templates"
        },
        {
          id: "ai-assist",
          label: "AI Assistant",
          icon: <Sparkles className="w-4 h-4" />,
          description: "AI-powered document suggestions"
        }
      ]
    },
    {
      id: "tools",
      title: "Advanced Tools",
      icon: <Wrench className="w-5 h-5" />,
      items: [
        {
          id: "validation",
          label: "Validation",
          icon: <CheckCircle className="w-4 h-4" />,
          description: "Validate document data and format"
        },
        {
          id: "export",
          label: "Export Options",
          icon: <Download className="w-4 h-4" />,
          description: "Export in various formats"
        },
        {
          id: "sharing",
          label: "Sharing",
          icon: <Share2 className="w-4 h-4" />,
          description: "Share documents with team"
        }
      ]
    }
  ];



  const recentActivity = [
    { action: "Generated LOE", time: "2 min ago", status: "success" },
    { action: "Updated template", time: "15 min ago", status: "info" },
    { action: "Bulk export", time: "1 hour ago", status: "success" }
  ];

  if (collapsed) {
    return (
      <aside className="fixed right-0 top-0 bottom-0 border-l border-gray-200 bg-white z-40 w-16 transition-all duration-200 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="flex flex-col items-center space-y-3 px-2">
              {toolSections.map((section) => (
                <button
                  key={section.id}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveSection(section.id)}
                  title={section.title}
                >
                  {section.icon}
                </button>
              ))}
            </nav>
          </div>

          {/* Toggle Button */}
          <div className="p-2 border-t border-gray-100">
            <button
              className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-all duration-200"
              onClick={onToggle}
              title="Expand Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed right-0 top-0 bottom-0 border-l border-gray-200 bg-white z-40 w-80 transition-all duration-200 ease-in-out shadow-lg">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Design Studio</h2>
                <p className="text-sm text-gray-600">Document creation tools</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>


        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tool Sections */}
          <div className="p-4 space-y-6">
            {toolSections.map((section) => (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 text-gray-500">{section.icon}</div>
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    {section.title}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${
                        item.id === "bulk" 
                          ? "border-blue-200 bg-blue-50 hover:bg-blue-100" 
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={item.action}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.id === "bulk" 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{item.label}</span>
                            {item.badge && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.badge === "New" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-orange-100 text-orange-700"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === "success" ? "bg-green-500" :
                    activity.status === "info" ? "bg-blue-500" : "bg-gray-500"
                  }`} />
                  <span className="text-gray-700">{activity.action}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600">Pro Tips</span>
            </div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {showNotes ? "Hide" : "Show"}
            </button>
          </div>
          
          {showNotes && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700 leading-relaxed">
                💡 Use bulk create for multiple documents. Save templates for faster workflow. 
                Customize branding for professional appearance.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default PortalRightSidebar;


