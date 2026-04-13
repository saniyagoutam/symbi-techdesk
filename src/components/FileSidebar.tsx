import { useRef } from "react";
import { useFiles } from "@/hooks/useFiles";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function FileSidebar() {
  const { files, uploading, uploadFile, deleteFile } = useFiles();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sm mb-3">Documents</h2>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90"
          size="sm"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? "Uploading..." : "Upload PDF"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {files.length === 0 && (
          <p className="text-xs text-sidebar-foreground/50 text-center py-8">
            No files uploaded yet
          </p>
        )}
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <FileText className="w-4 h-4 flex-shrink-0 text-sidebar-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-sidebar-foreground/50">
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                onClick={() => deleteFile(file.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-sidebar-border"
              >
                <Trash2 className="w-3 h-3 text-sidebar-foreground/60" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
