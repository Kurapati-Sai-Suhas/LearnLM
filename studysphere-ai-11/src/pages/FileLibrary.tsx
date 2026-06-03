import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, Search, FileText, Image as ImageIcon,
  FileCode, File, Loader2, Trash2, Download, Eye
} from "lucide-react";
import VisualSearch from "../components/VisualSearch";
import api from "@/services/api";

// ── Types ────────────────────────────────────────────────────
interface StudyGroup {
  id: number;
  name: string;
}

interface StudyMaterial {
  id: number;
  title: string;
  file: string;
  upload_date: string;
  uploaded_by: { username: string };
  study_group: { id: number; name: string };
}

// ── Helpers ──────────────────────────────────────────────────
function fileIcon(url: string) {
  const ext = url?.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
  if (['py', 'js', 'ts', 'java', 'cpp'].includes(ext)) return <FileCode className="w-5 h-5 text-green-500" />;
  return <File className="w-5 h-5 text-slate-400" />;
}

function isImage(url: string) {
  const ext = url?.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────
export default function FileLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showVisualSearch, setShowVisualSearch] = useState(false);

  // Groups & files
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [files, setFiles] = useState<StudyMaterial[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch groups on mount ────────────────────────────────────
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups/?page_size=100");
        setGroups(res.data.results || res.data || []);
      } catch (err) {
        console.error("Failed to load groups", err);
      }
    };
    fetchGroups();
  }, []);

  // ── Fetch files when group changes ──────────────────────────
  useEffect(() => {
    if (!selectedGroupId) return;
    const fetchFiles = async () => {
      setLoadingFiles(true);
      try {
        const res = await api.get(`/materials/?study_group=${selectedGroupId}`);
        setFiles(res.data.results || res.data || []);
      } catch (err) {
        console.error("Failed to load files", err);
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFiles();
  }, [selectedGroupId]);

  // ── Upload handler ───────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile || !selectedGroupId || !uploadTitle.trim()) {
      alert("Please select a group, enter a title, and choose a file.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to StudyMaterial (existing endpoint)
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('file', selectedFile);
      formData.append('study_group', selectedGroupId);

      await api.post('/materials/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. If it's an image, also index it for Visual Semantic Search (Module B)
      if (isImage(selectedFile.name)) {
        try {
          const vsFormData = new FormData();
          vsFormData.append('image', selectedFile);
          vsFormData.append('group_id', selectedGroupId);
          vsFormData.append('title', uploadTitle);
          await api.post('/visual-search/upload/', vsFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('✅ Image indexed for visual search (1280-dim MobileNetV2 vector stored)');
        } catch (vsErr) {
          // Don't block the user — visual search indexing is a bonus feature
          console.warn('Visual search indexing failed (non-critical):', vsErr);
        }
      }

      // 3. Refresh file list
      const res = await api.get(`/materials/?study_group=${selectedGroupId}`);
      setFiles(res.data.results || res.data || []);

      // 4. Reset form
      setUploadTitle("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Delete handler ───────────────────────────────────────────
  const handleDelete = async (materialId: number) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`/materials/${materialId}/`);
      setFiles((prev) => prev.filter((f) => f.id !== materialId));
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  const filteredFiles = files.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">File Library</h1>
          <p className="text-muted-foreground mt-1">Manage and search your study materials</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowVisualSearch(!showVisualSearch)}
            variant={showVisualSearch ? "secondary" : "outline"}
            className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            {showVisualSearch ? "Close AI Vision" : "AI Visual Search"}
          </Button>
        </div>
      </div>

      {/* Visual Search Panel */}
      {showVisualSearch && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <VisualSearch groupId={selectedGroupId || null} />
        </div>
      )}

      {/* Group Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select onValueChange={setSelectedGroupId} value={selectedGroupId}>
          <SelectTrigger className="w-[220px] h-11 border-slate-200 bg-white rounded-xl">
            <SelectValue placeholder="Select a Study Group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedGroupId && (
          <p className="text-sm text-slate-500">
            {files.length} file{files.length !== 1 ? 's' : ''} in this group
          </p>
        )}
      </div>

      {/* Upload Section */}
      {selectedGroupId && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" /> Upload New File
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="File title (e.g. Chapter 3 Notes)"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 border-slate-200 flex-1"
              />
              <label className="flex items-center gap-2 h-11 px-4 border border-slate-200 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors text-sm text-slate-600 shrink-0">
                <File className="w-4 h-4" />
                {selectedFile ? selectedFile.name : 'Choose File'}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.py,.js,.ts,.java,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadTitle.trim()}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl shrink-0"
              >
                {uploading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  : <><Upload className="w-4 h-4 mr-2" /> Upload</>
                }
              </Button>
            </div>
            {selectedFile && isImage(selectedFile.name) && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                This image will be automatically indexed for AI Visual Search
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* File List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">
            {selectedGroupId ? 'Files in Group' : 'My Files'}
          </h2>
          {selectedGroupId && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-10 h-9 rounded-xl bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {!selectedGroupId ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <FileText className="h-10 w-10 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Select a study group to see its files</p>
          </div>
        ) : loadingFiles ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <FileText className="h-10 w-10 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              {searchQuery ? 'No files match your search.' : 'No files uploaded yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                className="border-slate-200 hover:shadow-md transition-all group bg-white"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {fileIcon(file.file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate" title={file.title}>
                        {file.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {file.uploaded_by?.username} · {formatDate(file.upload_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${file.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs rounded-lg">
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                    </a>
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${file.file}`}
                      download
                    >
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <Download className="w-3 h-3" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}