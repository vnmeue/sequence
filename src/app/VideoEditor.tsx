"use client";

import React, { useState, useCallback, ChangeEvent, memo, useRef } from "react";
import {
  Upload,
  Play,
  Pause,
  Scissors,
  Undo,
  Redo,
  Film,
  Edit,
  Share,
  Settings,
  ChevronDown,
  HardDrive,
  Clock,
  Cpu,
  Maximize2,
  Minimize2,
  Volume2,
} from "lucide-react";

// Memoized submenu component for better performance
const SubMenu = memo(
  ({
    items,
    onItemClick,
  }: {
    items: MenuItem[];
    onItemClick: (id: string) => void;
  }) => (
    <div className="absolute top-full left-0 mt-1 bg-[#2A2A2A] border border-gray-800 rounded-md shadow-lg z-50 min-w-[180px]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="w-full px-3 py-1.5 text-xs text-left hover:bg-[#3A3A3A] flex justify-between items-center"
        >
          <span>{item.label}</span>
          {item.shortcut && (
            <span className="text-gray-400 text-xs">{item.shortcut}</span>
          )}
        </button>
      ))}
    </div>
  ),
);

SubMenu.displayName = "SubMenu";

// Types
interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  submenu?: MenuItem[];
  action?: () => void;
}

interface MenuSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface VideoState {
  file: File | null;
  url: string | null;
  duration: number;
  currentTime: number;
}

// Menu configurations with actions
const createMenuItems = (handlers: {
  handleNew: () => void;
  handleOpen: () => void;
  handleSave: () => void;
  handleImport: () => void;
  handleExport: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleFullscreen: () => void;
}): MenuItem[] => [
  {
    id: "file",
    label: "File",
    submenu: [
      {
        id: "new",
        label: "New Project",
        shortcut: "⌘N",
        action: handlers.handleNew,
      },
      {
        id: "open",
        label: "Open Project",
        shortcut: "⌘O",
        action: handlers.handleOpen,
      },
      {
        id: "save",
        label: "Save",
        shortcut: "⌘S",
        action: handlers.handleSave,
      },
      {
        id: "import",
        label: "Import Media",
        shortcut: "⌘I",
        action: handlers.handleImport,
      },
      {
        id: "export",
        label: "Export",
        shortcut: "⌘E",
        action: handlers.handleExport,
      },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    submenu: [
      {
        id: "undo",
        label: "Undo",
        shortcut: "⌘Z",
        action: handlers.handleUndo,
      },
      {
        id: "redo",
        label: "Redo",
        shortcut: "⇧⌘Z",
        action: handlers.handleRedo,
      },
    ],
  },
  {
    id: "view",
    label: "View",
    submenu: [
      {
        id: "zoomIn",
        label: "Zoom In",
        shortcut: "⌘+",
        action: handlers.handleZoomIn,
      },
      {
        id: "zoomOut",
        label: "Zoom Out",
        shortcut: "⌘-",
        action: handlers.handleZoomOut,
      },
      {
        id: "fullscreen",
        label: "Toggle Fullscreen",
        shortcut: "F11",
        action: handlers.toggleFullscreen,
      },
    ],
  },
];

const menuSections: MenuSection[] = [
  { id: "import", label: "Import", icon: <Film className="w-4 h-4" /> },
  { id: "edit", label: "Edit", icon: <Edit className="w-4 h-4" /> },
  { id: "export", label: "Export", icon: <Share className="w-4 h-4" /> },
];

const VideoEditor: React.FC = () => {
  // Refs for improved performance
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [activeSection, setActiveSection] = useState("import");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>({
    file: null,
    url: null,
    duration: 0,
    currentTime: 0,
  });

  // Menu action handlers
  const handlers = {
    handleNew: () => {
      setVideoState({ file: null, url: null, duration: 0, currentTime: 0 });
    },
    handleOpen: () => {
      fileInputRef.current?.click();
    },
    handleSave: () => {
      // Implement save functionality
      console.log("Saving project...");
    },
    handleImport: () => {
      fileInputRef.current?.click();
    },
    handleExport: () => {
      // Implement export functionality
      console.log("Exporting project...");
    },
    handleUndo: () => {
      // Implement undo functionality
      console.log("Undo action");
    },
    handleRedo: () => {
      // Implement redo functionality
      console.log("Redo action");
    },
    handleZoomIn: () => {
      // Implement zoom in functionality
      console.log("Zoom in");
    },
    handleZoomOut: () => {
      // Implement zoom out functionality
      console.log("Zoom out");
    },
    toggleFullscreen: useCallback(() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }, []),
  };

  const menuItems = createMenuItems(handlers);

  // File handling functions
  const processVideoFile = useCallback((file: File) => {
    if (file.type.startsWith("video/") || file.name.endsWith(".mkv")) {
      const url = URL.createObjectURL(file);
      setVideoState((prev) => ({
        ...prev,
        file,
        url,
      }));
    } else {
      console.error("Invalid file type. Please use MP4 or MKV files.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processVideoFile(file);
    },
    [processVideoFile],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processVideoFile(file);
    },
    [processVideoFile],
  );

  // Utility functions
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-[#1A1A1A] text-gray-200 flex flex-col overflow-hidden">
      {/* Status Bar Menu */}
      <div className="bg-[#111111] border-b border-gray-800 flex items-center h-6 px-2">
        {menuItems.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              onClick={() =>
                setActiveMenu(activeMenu === menu.id ? null : menu.id)
              }
              className={`px-2 py-0.5 text-xs hover:bg-[#2A2A2A] rounded-sm ${
                activeMenu === menu.id ? "bg-[#2A2A2A]" : ""
              }`}
            >
              {menu.label}
            </button>
            {activeMenu === menu.id && menu.submenu && (
              <SubMenu
                items={menu.submenu}
                onItemClick={(id) => {
                  const item = menu.submenu?.find((i) => i.id === id);
                  item?.action?.();
                  setActiveMenu(null);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Toolbar */}
      <div className="bg-[#111111] border-b border-gray-800">
        <div className="flex items-center h-8">
          <div className="px-3 py-1 border-r border-gray-800">
            <h1 className="text-sm font-bold text-white">sequence</h1>
          </div>

          <div className="flex">
            {menuSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  px-4 py-1.5 flex items-center gap-1.5 text-xs
                  border-r border-gray-800
                  transition-colors duration-150
                  ${
                    activeSection === section.id
                      ? "bg-[#2A2A2A] text-white"
                      : "hover:bg-[#222222]"
                  }
                `}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>

          <div className="ml-auto px-2">
            <button className="p-1 hover:bg-[#222222] rounded-md">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow relative">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {!videoState.file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8
                flex flex-col items-center justify-center
                transition-colors duration-200
                w-full h-full
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }
              `}
            >
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="text-lg mb-2">Drag and drop your video here</p>
              <p className="text-xs text-gray-400 mb-3">
                Supported formats: MP4, MKV
              </p>
              <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm cursor-pointer">
                Choose File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/x-matroska,.mkv"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="w-full h-full grid grid-rows-[2fr,1fr] gap-2">
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoState.url ?? undefined}
                  className="w-full h-full object-contain"
                  controls
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    setVideoState((prev) => ({
                      ...prev,
                      duration: video.duration,
                    }));
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    setVideoState((prev) => ({
                      ...prev,
                      currentTime: video.currentTime,
                    }));
                  }}
                />
              </div>

              <div className="bg-[#222222] rounded-lg border border-gray-800 flex flex-col">
                <div className="flex items-center gap-2 p-1 border-b border-gray-800">
                  <button
                    onClick={handlers.handleUndo}
                    className="p-1 hover:bg-[#333333] rounded-md"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlers.handleRedo}
                    className="p-1 hover:bg-[#333333] rounded-md"
                  >
                    <Redo className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-gray-700" />
                  <button className="p-1 hover:bg-[#333333] rounded-md">
                    <Scissors className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-grow bg-[#2A2A2A] relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                    Timeline preview will appear here
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Status Bar */}
      <div className="bg-[#111111] border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center justify-between px-3 h-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {videoState.file ? videoState.file.name : "No file loaded"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(videoState.currentTime)} /{" "}
              {formatTime(videoState.duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>30 FPS</span>
            <span>1920x1080</span>
            <span>Project: 30fps</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              CPU: 32%
            </span>
            <span className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              48kHz
            </span>
            <button
              onClick={handlers.toggleFullscreen}
              className="hover:text-white"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keyboard shortcuts handler
const useKeyboardShortcuts = (handlers: Record<string, () => void>) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            handlers.handleNew();
            break;
          case "o":
            e.preventDefault();
            handlers.handleOpen();
            break;
          case "s":
            e.preventDefault();
            handlers.handleSave();
            break;
          case "i":
            e.preventDefault();
            handlers.handleImport();
            break;
          case "e":
            e.preventDefault();
            handlers.handleExport();
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handlers.handleRedo();
            } else {
              handlers.handleUndo();
            }
            break;
          case "=":
            e.preventDefault();
            handlers.handleZoomIn();
            break;
          case "-":
            e.preventDefault();
            handlers.handleZoomOut();
            break;
        }
      } else if (e.key === "F11") {
        e.preventDefault();
        handlers.toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
};

// Export a memoized version of the component for better performance
export default memo(VideoEditor);
