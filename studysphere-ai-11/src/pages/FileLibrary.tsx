import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Upload, Search, FileText } from "lucide-react";

export default function FileLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  // 👇 Empty array (No dummy data)
  const files: any[] = []; 

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">File Library</h1>
          <p className="text-muted-foreground mt-1">Manage your study materials</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Upload className="h-4 w-4 mr-2" /> Upload Files
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search files..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Empty State */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">My Files</h2>
        {files.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3"/>
                <p className="text-muted-foreground">No files uploaded yet.</p>
                <Button variant="link" className="text-primary">Upload your first file</Button>
            </div>
        ) : (
            <div>{/* File list will go here later */}</div>
        )}
      </div>
    </div>
  );
}