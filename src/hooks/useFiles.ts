import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { extractTextFromPdf } from "@/lib/pdf-extract";

export interface UploadedFile {
  name: string;
  size: number;
  created_at: string;
}

export function useFiles() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    const { data, error } = await supabase.storage
      .from("helpdesk-files")
      .list("", { sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      console.error("Error fetching files:", error);
      return;
    }
    setFiles(
      (data || [])
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name,
          size: f.metadata?.size || 0,
          created_at: f.created_at || "",
        }))
    );
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Only PDF files are allowed");
        return;
      }
      setUploading(true);
      try {
        // Extract text from PDF
        toast.info("Extracting text from PDF...");
        const text = await extractTextFromPdf(file);

        if (!text || !text.trim()) {
          toast.warning("Could not extract text from this PDF. It may be scanned/image-based.");
        }

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("helpdesk-files")
          .upload(file.name, file, { upsert: true });

        if (uploadError) {
          toast.error("Upload failed: " + uploadError.message);
          setUploading(false);
          return;
        }

        // Store extracted text in database
        const { data, error: textError } = await supabase
          .from("document_texts")
          .upsert(
            { filename: file.name, content: text || "[No text extracted]" },
            { onConflict: "filename" }
          )
          .select();

        if (textError) {
          console.error("Error storing text:", textError);
          toast.error("Failed to store document text: " + textError.message);
        } else {
          console.log("Document text stored:", { filename: file.name, size: text?.length });
          toast.success("File uploaded and indexed successfully");
        }
        
        await fetchFiles();
      } catch (e) {
        console.error("Upload error:", e);
        toast.error("Failed to process PDF: " + (e instanceof Error ? e.message : "Unknown error"));
      }
      setUploading(false);
    },
    [fetchFiles]
  );

  const deleteFile = useCallback(
    async (filename: string) => {
      const { error } = await supabase.storage
        .from("helpdesk-files")
        .remove([filename]);

      if (error) {
        toast.error("Delete failed: " + error.message);
        return;
      }

      // Also delete extracted text
      await supabase.from("document_texts").delete().eq("filename", filename);

      toast.success("File deleted");
      await fetchFiles();
    },
    [fetchFiles]
  );

  return { files, uploading, uploadFile, deleteFile };
}
