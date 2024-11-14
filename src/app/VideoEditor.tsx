"use client";

import React, {
  useState,
  useCallback,
  ChangeEvent,
  memo,
  useRef,
  useEffect,
} from "react";
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
  Trash2,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: string;
  duration?: number;
  thumbnail?: string;
}

interface VideoState {
  mediaFiles: MediaFile[];
  currentTime: number[];
}

interface TimelineClip {
  id: string;
  mediaFileId: string;
  startTime: number;
  duration: number;
  track: number;
}

// Memoized submenu component
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

// Menu configurations
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

// Main component
const VideoEditor: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState("import");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [selectedMediaFile, setSelectedMediaFile] = useState<string | null>(
    null,
  );

  const [videoState, setVideoState] = useState<VideoState>({
    mediaFiles: [],
    currentTime: [],
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handlers.handleRedo();
            } else {
              handlers.handleUndo();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handlers = {
    handleNew: () => {
      setVideoState({
        mediaFiles: [],
        currentTime: [],
      });
      setTimelineClips([]);
    },
    handleOpen: () => {
      fileInputRef.current?.click();
    },
    handleSave: () => {
      console.log("Saving project...");
    },
    handleImport: () => {
      fileInputRef.current?.click();
    },
    handleExport: () => {
      console.log("Exporting project...");
    },
    handleUndo: () => {
      console.log("Undo action");
    },
    handleRedo: () => {
      console.log("Redo action");
    },
    handleZoomIn: () => {
      console.log("Zoom in");
    },
    handleZoomOut: () => {
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

  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);
        video.onloadeddata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 160;
          canvas.height = 90;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            video.currentTime = 1;
            video.onseeked = () => {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL());
            };
          }
        };
      } else if (file.type.startsWith("image/")) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 160;
          canvas.height = 90;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL());
          }
        };
      }
    });
  };

  const processMediaFiles = useCallback(async (files: File[]) => {
    const newMediaFiles: MediaFile[] = [];

    for (const file of files) {
      if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substr(2, 9);
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith("video/") ? "video" : "image";
        const thumbnail = await generateThumbnail(file);

        newMediaFiles.push({
          id,
          file,
          url,
          type,
          thumbnail,
        });
      }
    }

    setVideoState((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...newMediaFiles],
    }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      // Get files from drag event
      const items = Array.from(e.dataTransfer.items);
      const files: File[] = [];

      // Process each item
      items.forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (
            file &&
            (file.type.startsWith("video/") || file.type.startsWith("image/"))
          ) {
            files.push(file);
          }
        }
      });

      if (files.length > 0) {
        processMediaFiles(files);
      }
    },
    [processMediaFiles],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(
        (file) =>
          file.type.startsWith("video/") || file.type.startsWith("image/"),
      );
      if (files.length > 0) {
        processMediaFiles(files);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processMediaFiles],
  );

  const handleMediaDragStart =
    (mediaFileId: string) => (e: React.DragEvent) => {
      e.dataTransfer.setData("mediaFileId", mediaFileId);
      e.dataTransfer.effectAllowed = "move";
    };

  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleTimelineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const mediaFileId = e.dataTransfer.getData("mediaFileId");
    const mediaFile = videoState.mediaFiles.find((f) => f.id === mediaFileId);

    if (mediaFile) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate track based on Y position
      const track = Math.floor((y - 20) / ((rect.height - 20) / 3)); // Subtract header height

      // Ensure track is within bounds
      const boundedTrack = Math.max(0, Math.min(2, track));

      // Calculate start time based on X position (assuming 100px = 1 second)
      const startTime = Math.max(0, x / 100);

      const newClip: TimelineClip = {
        id: Math.random().toString(36).substr(2, 9),
        mediaFileId,
        startTime,
        duration: 5, // Default duration
        track: boundedTrack,
      };

      setTimelineClips((prev) => [...prev, newClip]);
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(2, "0")}`;
  };

  const removeMediaFile = (id: string) => {
    setVideoState((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((file) => file.id !== id),
    }));
    setTimelineClips((prev) => prev.filter((clip) => clip.mediaFileId !== id));
    if (selectedMediaFile === id) {
      setSelectedMediaFile(null);
    }
  };

  return (
    <div className="h-screen bg-[#1A1A1A] text-gray-200 flex flex-col overflow-hidden">
      {/* Hidden file input for importing media */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Menu Bar */}
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

      {/* Navigation Bar */}
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
      <main
        className="flex-grow flex"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Only set dragging false if we've actually left the main area
          if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
      >
        {/* Import Library (only visible in import section) */}
        {activeSection === "import" && (
          <div className="w-64 bg-[#1A1A1A] border-r border-gray-800 flex flex-col">
            <div className="p-2 border-b border-gray-800 flex justify-between items-center">
              <span className="text-xs font-medium">Import Library</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:bg-[#222222] rounded-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {videoState.mediaFiles.map((media) => (
                <div
                  key={media.id}
                  className={`p-2 border-b border-gray-800 hover:bg-[#222222] cursor-move ${
                    selectedMediaFile === media.id ? "bg-[#2A2A2A]" : ""
                  }`}
                  draggable
                  onDragStart={handleMediaDragStart(media.id)}
                  onClick={() => setSelectedMediaFile(media.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-20 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                      {media.thumbnail && (
                        <img
                          src={media.thumbnail}
                          alt={media.file.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs truncate">{media.file.name}</p>
                      <p className="text-xs text-gray-400">
                        {(media.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMediaFile(media.id);
                      }}
                      className="p-1 hover:bg-[#333333] rounded-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Preview/Content Area */}
        <div className="flex-grow flex flex-col">
          {/* Preview Area */}
          <div className="flex-grow relative">
            {videoState.mediaFiles.length === 0 ? (
              <div
                className={`
                                  absolute inset-0 m-2
                                  border-2 border-dashed rounded-lg
                                  flex flex-col items-center justify-center
                                  transition-colors duration-200
                                  ${
                                    isDragging
                                      ? "border-blue-500 bg-blue-500/10"
                                      : "border-gray-700 hover:border-gray-600"
                                  }
                                `}
              >
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="text-lg mb-2">Drag and drop your media here</p>
                <p className="text-xs text-gray-400 mb-3">
                  Supported formats: MP4, MKV, JPG, PNG
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
                >
                  Choose Files
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 m-2 bg-black rounded-lg overflow-hidden">
                {selectedMediaFile && (
                  <div className="w-full h-full flex items-center justify-center">
                    {(() => {
                      const media = videoState.mediaFiles.find(
                        (m) => m.id === selectedMediaFile,
                      );
                      if (!media) return null;

                      if (media.type === "video") {
                        return (
                          <video
                            src={media.url}
                            className="max-w-full max-h-full"
                            controls
                          />
                        );
                      } else if (media.type === "image") {
                        return (
                          <img
                            src={media.url}
                            alt={media.file.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div
            className="h-32 bg-[#111111] border-t border-gray-800 overflow-x-auto"
            onDragOver={handleTimelineDragOver}
            onDrop={handleTimelineDrop}
          >
            <div className="relative h-full" style={{ minWidth: "1000px" }}>
              {/* Time markers */}
              <div className="h-5 border-b border-gray-800 flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[100px] flex-shrink-0 border-r border-gray-800 text-xs text-gray-400 px-1"
                  >
                    {formatTime(i)}
                  </div>
                ))}
              </div>

              {/* Tracks */}
              <div className="flex flex-col h-[calc(100%-20px)]">
                {Array.from({ length: 3 }).map((_, trackIndex) => (
                  <div
                    key={trackIndex}
                    className="h-[33.33%] border-b border-gray-800 relative"
                  >
                    {timelineClips
                      .filter((clip) => clip.track === trackIndex)
                      .map((clip) => {
                        const media = videoState.mediaFiles.find(
                          (m) => m.id === clip.mediaFileId,
                        );
                        if (!media) return null;

                        return (
                          <div
                            key={clip.id}
                            className="absolute h-full bg-blue-600 rounded cursor-move"
                            style={{
                              left: `${clip.startTime * 100}px`,
                              width: `${clip.duration * 100}px`,
                            }}
                          >
                            <div className="p-1 text-xs truncate">
                              {media.file.name}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <div className="bg-[#111111] border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center justify-between px-3 h-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {videoState.mediaFiles.length} files
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(0)}
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

export default memo(VideoEditor);
