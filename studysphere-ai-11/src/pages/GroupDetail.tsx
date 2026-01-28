import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupsAPI, userAPI } from "@/services/api"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // 👈 Import Input
import { Label } from "@/components/ui/label"; // 👈 Import Label
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// 👇 IMPORT DIALOG COMPONENTS
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"; 
import { ArrowLeft, Users, FileText, MessageSquare, Upload, Send, Download } from "lucide-react";

export default function GroupDetail() {
  const params = useParams();
  const id = params.id || params.groupId; 
  const navigate = useNavigate();

  // Data States
  const [group, setGroup] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]); // 👈 Add Files State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  // 👇 UPLOAD POPUP STATES
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const groupRes = await groupsAPI.getById(id);
        setGroup(groupRes.data);

        // Fetch User (for chat bubble colors)
        const userRes = await userAPI.getProfile();
        setCurrentUser(userRes.data);

        // Fetch Files
        fetchFiles();

      } catch (error) {
        console.error("Failed to load group", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchFiles = async () => {
      if (!id) return;
      try {
          const res = await groupsAPI.getMaterials(id);
          setFiles(res.data.results || res.data || []);
      } catch (e) { console.error("File fetch error", e); }
  };

  // 👇 HANDLE UPLOAD LOGIC
  const handleUpload = async () => {
      if (!fileToUpload || !id || !fileTitle) {
          alert("Please select a file and enter a title!");
          return;
      }
      setUploading(true);
      try {
          await groupsAPI.uploadMaterial(fileTitle, fileToUpload, id);
          alert("File Uploaded Successfully! 🎉");
          setFileToUpload(null);
          setFileTitle("");
          setIsUploadOpen(false); // Close Popup
          fetchFiles(); // Refresh list
      } catch (err) {
          console.error(err);
          alert("Upload failed. Check console.");
      } finally {
          setUploading(false);
      }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Optimistic Chat Update
      const tempMsg = {
          id: Date.now(),
          sender: currentUser?.username || "Me",
          text: newMessage,
          timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);
      setNewMessage("");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Group...</div>;
  if (!group) return <div className="p-10 text-center">Group not found!</div>;

  return (
    <div className="space-y-6 animate-fade-in p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
          <p className="text-muted-foreground mt-1">{group.description}</p>
        </div>
        {/* 👇 FIX: Show Code or 'N/A' */}
        <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
          Code: {group.join_code || "N/A"}
        </Badge>
      </div>

      {/* Group Info Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Group Information</CardTitle>
          {/* 👇 FIX: Handle Date safely */}
          <CardDescription>
            Created on {group.created_at ? new Date(group.created_at).toLocaleDateString() : "Unknown Date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.members ? group.members.length : 0} / {group.capacity} members</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discussions"><MessageSquare className="h-4 w-4 mr-2" /> Discussions</TabsTrigger>
            <TabsTrigger value="files"><FileText className="h-4 w-4 mr-2" /> Files</TabsTrigger>
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" /> Members</TabsTrigger>
        </TabsList>

        {/* 1. FILES TAB (With Popup) */}
        <TabsContent value="files" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Shared Files</CardTitle>
                
                {/* 👇 POPUP TRIGGER */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Study Material</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>File Title</Label>
                                <Input 
                                    placeholder="e.g. Calculus Notes" 
                                    value={fileTitle} 
                                    onChange={(e) => setFileTitle(e.target.value)} 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Select File</Label>
                                <Input 
                                    type="file" 
                                    onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpload} disabled={uploading}>
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
                {files.length === 0 ? (
                    <div className="space-y-3 text-center py-10 text-muted-foreground">
                        <p>No files uploaded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {files.map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <a href={file.file} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                                            {file.title || "Untitled"}
                                        </a>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(file.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href={file.file} target="_blank" rel="noreferrer">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... Keep Discussions and Members tabs unchanged ... */}
        {/* Just paste the rest of your original TabsContent for 'discussions' and 'members' here */}
        <TabsContent value="discussions" className="space-y-4 mt-4">
            <Card className="border-border">
                <CardHeader><CardTitle>Group Discussion</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                        {messages.length === 0 ? (
                            <p className="text-center text-muted-foreground">No messages yet.</p>
                        ) : (
                            messages.map((msg: any) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender === currentUser?.username ? "flex-row-reverse" : ""}`}>
                                    <Avatar className="w-8 h-8"><AvatarFallback>{msg.sender[0]}</AvatarFallback></Avatar>
                                    <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === currentUser?.username ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        <p className="text-xs opacity-70 mb-1">{msg.sender}</p>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                     <div className="flex gap-2 pt-4 border-t">
                        <Textarea placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="min-h-[60px]" />
                        <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4 mt-4">
             {/* ... Your existing Members code ... */}
             <Card><CardContent className="p-4">Members list coming from API...</CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}