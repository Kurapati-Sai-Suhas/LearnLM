import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupsAPI } from "@/services/api"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, FileText, MessageSquare, Upload, Send } from "lucide-react";

export default function GroupDetail() {
  // 👇 FIX: Check for 'id' OR 'groupId' so it never fails
  const params = useParams();
  const id = params.id || params.groupId; 

  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return; // Don't fetch if ID is missing
      try {
        const data = await groupsAPI.getById(id);
        setGroup(data);
      } catch (error) {
        console.error("Failed to load group", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      alert("Chat feature coming soon!");
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
        <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
          Code: {group.join_code}
        </Badge>
      </div>

      {/* Group Info Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Group Information</CardTitle>
          <CardDescription>Created on {new Date(group.created_at).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.members ? group.members.length : 0} / {group.capacity} members</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="discussions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>

        {/* 1. DISCUSSIONS TAB */}
        <TabsContent value="discussions" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Group Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto text-center py-10 text-muted-foreground">
                <p>Chat messages will appear here.</p>
                <p className="text-xs">(This feature is in Day 12 roadmap!)</p>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. FILES TAB */}
        <TabsContent value="files" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Shared Files</CardTitle>
                <Button size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-center py-10 text-muted-foreground">
                 <p>No files uploaded yet.</p>
                 <p className="text-xs">(File uploading coming in Day 9!)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. MEMBERS TAB */}
        <TabsContent value="members" className="space-y-4 mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Group Members</CardTitle>
              <CardDescription>{group.members ? group.members.length : 0} total members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.members && group.members.length > 0 ? (
                    group.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg border-border">
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                            {member.username ? member.username[0].toUpperCase() : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-foreground">{member.username}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        </div>
                        <Badge variant="secondary">Member</Badge>
                    </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center">No members yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}