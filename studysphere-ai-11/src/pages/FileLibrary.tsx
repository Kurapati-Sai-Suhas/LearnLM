import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Upload, Search, FileText, Image, FileCode, Download, Trash2 } from "lucide-react";

export default function FileLibrary() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be fetched from Django API
  const files = [
    {
      id: 1,
      name: "Calculus Chapter 5 Notes.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadedBy: "John Doe",
      uploadedAt: "2 days ago",
      group: "Math Wizards",
    },
    {
      id: 2,
      name: "Physics Lab Report.docx",
      type: "document",
      size: "1.8 MB",
      uploadedBy: "Sarah Johnson",
      uploadedAt: "5 days ago",
      group: "Physics Masters",
    },
    {
      id: 3,
      name: "Chemistry Formulas.png",
      type: "image",
      size: "856 KB",
      uploadedBy: "Mike Chen",
      uploadedAt: "1 week ago",
      group: "Chem Club",
    },
    {
      id: 4,
      name: "Algorithm Implementation.py",
      type: "code",
      size: "24 KB",
      uploadedBy: "Emily Davis",
      uploadedAt: "3 days ago",
      group: "Data Structures & Algorithms",
    },
  ];

  const folders = [
    { id: 1, name: "Mathematics", fileCount: 24, color: "bg-primary" },
    { id: 2, name: "Physics", fileCount: 18, color: "bg-success" },
    { id: 3, name: "Chemistry", fileCount: 15, color: "bg-warning" },
    { id: 4, name: "Computer Science", fileCount: 32, color: "bg-accent" },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
      case "document":
        return FileText;
      case "image":
        return Image;
      case "code":
        return FileCode;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">File Library</h1>
          <p className="text-muted-foreground mt-1">Access and manage your study materials</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files by name or type..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Folders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Folders</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {folders.map((folder) => (
            <Card key={folder.id} className="border-border hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-lg ${folder.color}/10 flex items-center justify-center`}>
                    <FolderOpen className={`h-6 w-6 ${folder.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">{folder.fileCount} files</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Recent Files</h2>
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {file.group}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="border-border border-dashed border-2 bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Upload Study Materials</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Drag and drop files here or click to browse. Supported formats: PDF, DOC, PNG, JPG, etc.
            </p>
            <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
