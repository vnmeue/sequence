"use client";

import React, { useState, useCallback, ChangeEvent, useRef, memo } from "react";
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

// Types remain the same as in original code
interface MenuSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  submenu?: MenuItem[];
}

interface VideoState {
  file: File | null;
  url: string | null;
  duration: number;
  currentTime: number;
}

interface TimelineState {
  zoom: number;
  position: number;
}

interface EditorState {
  isDragging: boolean;
  isPlaying: boolean;
  activeSection: string;
  activeMenu: string | null;
  fps: number;
  video: VideoState;
  timeline: TimelineState;
}

type VideoFileType = File & {
  type: string;
};

// Menu configurations remain the same
const menuItems: MenuItem[] = [
  {
    id: "file",
    label: "File",
    submenu: [
      { id: "new", label: "New Project", shortcut: "⌘N" },
      { id: "open", label: "Open Project", shortcut: "⌘O" },
      { id: "save", label: "Save", shortcut: "⌘S" },
      { id: "saveAs", label: "Save As...", shortcut: "⇧⌘S" },
      { id: "import", label: "Import Media", shortcut: "⌘I" },
      { id: "export", label: "Export", shortcut: "⌘E" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    submenu: [
      { id: "undo", label: "Undo", shortcut: "⌘Z" },
      { id: "redo", label: "Redo", shortcut: "⇧⌘Z" },
      { id: "cut", label: "Cut", shortcut: "⌘X" },
      { id: "copy", label: "Copy", shortcut: "⌘C" },
      { id: "paste", label: "Paste", shortcut: "⌘V" },
    ],
  },
  {
    id: "view",
    label: "View",
    submenu: [
      { id: "zoomIn", label: "Zoom In", shortcut: "⌘+" },
      { id: "zoomOut", label: "Zoom Out", shortcut: "⌘-" },
      { id: "fullscreen", label: "Toggle Fullscreen", shortcut: "F11" },
    ],
  },
];

const menuSections: MenuSection[] = [
  { id: "import", label: "Import", icon: <Film className="w-4 h-4" /> },
  { id: "edit", label: "Edit", icon: <Edit className="w-4 h-4" /> },
  { id: "export", label: "Export", icon: <Share className="w-4 h-4" /> },
];

const initialEditorState: EditorState = {
  isDragging: false,
  isPlaying: false,
  activeSection: "import",
  activeMenu: null,
  fps: 30,
  video: {
    file: null,
    url: null,
    duration: 0,
    currentTime: 0,
  },
  timeline: {
    zoom: 1,
    position: 0,
  },
};

const VideoEditor: React.FC = () => {
  const [editorState, setEditorState] =
    useState<EditorState>(initialEditorState);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // All handler functions remain the same as in original code
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setEditorState((prev) => ({ ...prev, isDragging: true }));
    },
    [],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setEditorState((prev) => ({ ...prev, isDragging: false }));
    },
    [],
  );

  const processVideoFile = useCallback((file: VideoFileType): void => {
    if (file.type.startsWith("video/") || file.name.endsWith(".mkv")) {
      const url = URL.createObjectURL(file);
      setEditorState((prev) => ({
        ...prev,
        video: {
          ...prev.video,
          file,
          url,
        },
      }));
    } else {
      console.error("Invalid file type. Please use MP4 or MKV files.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setEditorState((prev) => ({ ...prev, isDragging: false }));
      const files = e.dataTransfer.files;
      if (files[0]) {
        processVideoFile(files[0] as VideoFileType);
      }
    },
    [processVideoFile],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) {
        processVideoFile(file as VideoFileType);
      }
    },
    [processVideoFile],
  );

  const handleVideoLoad = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>): void => {
      const video = e.target as HTMLVideoElement;
      setEditorState((prev) => ({
        ...prev,
        video: {
          ...prev.video,
          duration: video.duration,
        },
      }));
    },
    [],
  );

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>): void => {
      const video = e.target as HTMLVideoElement;
      setEditorState((prev) => ({
        ...prev,
        video: {
          ...prev.video,
          currentTime: video.currentTime,
        },
      }));
    },
    [],
  );

  const handleSectionChange = useCallback((sectionId: string): void => {
    setEditorState((prev) => ({
      ...prev,
      activeSection: sectionId,
    }));
  }, []);

  const handleMenuClick = useCallback((menuId: string) => {
    setEditorState((prev) => ({
      ...prev,
      activeMenu: prev.activeMenu === menuId ? null : menuId,
    }));
  }, []);

  const handleMenuItemClick = useCallback((itemId: string) => {
    console.log(`Menu item clicked: ${itemId}`);
    setEditorState((prev) => ({ ...prev, activeMenu: null }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const { isDragging, video, activeSection, activeMenu, fps } = editorState;

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-[#1A1A1A] text-gray-200 flex flex-col">
      {/* Status Bar Menu - Reduced height */}
      <div className="bg-[#111111] border-b border-gray-800 flex items-center h-6 px-2">
        {menuItems.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              onClick={() => handleMenuClick(menu.id)}
              className={`px-2 py-0.5 text-xs hover:bg-[#2A2A2A] rounded-sm ${
                activeMenu === menu.id ? "bg-[#2A2A2A]" : ""
              }`}
            >
              {menu.label}
            </button>
            {activeMenu === menu.id && menu.submenu && (
              <div className="absolute top-full left-0 mt-1 bg-[#2A2A2A] border border-gray-800 rounded-md shadow-lg z-50 min-w-[180px]">
                {menu.submenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className="w-full px-3 py-1.5 text-xs text-left hover:bg-[#3A3A3A] flex justify-between items-center"
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="text-gray-400 text-xs">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Toolbar - Reduced height */}
      <div className="bg-[#111111] border-b border-gray-800">
        <div className="flex items-center h-8">
          <div className="px-3 py-1 border-r border-gray-800">
            <h1 className="text-sm font-bold text-white">sequence</h1>
          </div>

          <div className="flex">
            {menuSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
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

      {/* Main Content - Flex-grow to fill available space */}
      <main className="flex-grow flex items-center justify-center p-2">
        {!video.file ? (
          // Upload Area - More compact
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
            role="button"
            tabIndex={0}
          >
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="text-lg mb-2">Drag and drop your video here</p>
            <p className="text-xs text-gray-400 mb-3">
              Supported formats: MP4, MKV
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm cursor-pointer">
              Choose File
              <input
                type="file"
                accept="video/mp4,video/x-matroska,.mkv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          // Video Editor Interface - More compact layout
          <div className="w-full h-full grid grid-rows-[2fr,1fr] gap-2">
            {/* Preview Window */}
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={video.url ?? undefined}
                className="w-full h-full object-contain"
                controls
                onLoadedMetadata={handleVideoLoad}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>

            {/* Timeline */}
            <div className="bg-[#222222] rounded-lg border border-gray-800 flex flex-col">
              <div className="flex items-center gap-2 p-1 border-b border-gray-800">
                <button className="p-1 hover:bg-[#333333] rounded-md">
                  <Undo className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-[#333333] rounded-md">
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
      </main>

      {/* Bottom Status Bar - Reduced height */}
      <div className="bg-[#111111] border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center justify-between px-3 h-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {video.file ? video.file.name : "No file loaded"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(video.currentTime)} / {formatTime(video.duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>{fps} FPS</span>
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
            <button onClick={toggleFullscreen} className="hover:text-white">
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

export default VideoEditor;
