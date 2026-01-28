import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, LogIn, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"; 
import api, { groupsAPI } from "@/services/api"; 

export default function StudyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 

  // 👇 SIMPLE PAGINATION STATE
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Inputs
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupCode, setNewGroupCode] = useState("");
  const [newGroupCapacity, setNewGroupCapacity] = useState(10);
  const [joinCode, setJoinCode] = useState("");

  // 👇 THE FIX: Let Axios handle the URL
  const fetchGroups = async (pageNum: number) => {
    setLoading(true);
    setError(""); 
    try {
      // 1. We use the exact endpoint 'groups/' (No leading slash is safer for baseURLs)
      // 2. We pass 'params' object. Axios converts this to "?page=2" automatically.
      const response = await api.get('groups/', { 
          params: { page: pageNum } 
      });

      const data = response.data;
      
      // Update List
      setGroups(data.results || []);
      
      // Update Buttons (Django sends null if no next/prev page)
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);

    } catch (err: any) {
      console.error("Fetch error:", err);
      // Show error on screen so we know if it's a 404 or Network Error
      setError(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever 'page' changes
  useEffect(() => {
    fetchGroups(page);
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await groupsAPI.create({
        name: newGroupName,
        description: newGroupDesc,
        join_code: newGroupCode,
        capacity: newGroupCapacity
      });
      alert("Group Created! 🎉");
      setNewGroupName("");
      setNewGroupDesc("");
      setNewGroupCode("");
      setNewGroupCapacity(10);
      
      // Go back to page 1 to see the new group
      setPage(1);
      fetchGroups(1); 
    } catch (err) {
      alert("Error creating group.");
    }
  };

  const handleJoin = async () => {
    try {
      await groupsAPI.join(joinCode);
      alert("Joined Successfully!");
      setJoinCode("");
      fetchGroups(page);
    } catch (err: any) {
        alert(err.response?.data?.error || "Error joining group");
    }
  };

  if (loading && groups.length === 0) return <div className="p-10 text-center">Loading List...</div>;

  return (
    // 👇 ADDED: max-w-7xl mx-auto w-full (This centers the content)
    <div className="space-y-8 p-8 animate-fade-in max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Study Groups</h1>

      {/* 👇 ERROR BOX (If something is wrong, this will tell us) */}
      {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center gap-2 border border-destructive/20">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
              <Button variant="link" size="sm" onClick={() => fetchGroups(page)}>Retry</Button>
          </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {/* LEFT COLUMN: Controls */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader><CardTitle>Menu</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="join">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="join">Join</TabsTrigger>
                  <TabsTrigger value="create">Create</TabsTrigger>
                </TabsList>

                <TabsContent value="join" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Group Code</Label>
                    <div className="flex gap-2">
                        <Input placeholder="Enter Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                        <Button onClick={handleJoin}><LogIn className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-4 pt-4">
                  <form onSubmit={handleCreate} className="space-y-3">
                    <div><Label>Group Name</Label><Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required /></div>
                    <div><Label>Description</Label><Input value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} required /></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><Label>Code</Label><Input value={newGroupCode} onChange={(e) => setNewGroupCode(e.target.value)} required /></div>
                        <div><Label>Capacity</Label><Input type="number" min={1} value={newGroupCapacity} onChange={(e) => setNewGroupCapacity(Number(e.target.value))} required /></div>
                    </div>
                    <Button type="submit" className="w-full">Create Group</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: List */}
        <div className="md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.length === 0 && !error ? (
                <p className="col-span-full text-center text-gray-500 mt-10">No groups found.</p>
            ) : (
                groups.map((group: any) => (
                <Link to={`/groups/${group.id}`} key={group.id}>
                    <Card className="hover:shadow-lg transition cursor-pointer h-full">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="truncate">{group.name}</CardTitle>
                            <span className="text-xs bg-secondary px-2 py-1 rounded font-mono whitespace-nowrap">
                            {group.members ? group.members.length : 0} / {group.capacity || 10}
                            </span>
                        </div>
                        <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="text-xs text-muted-foreground flex justify-between mt-auto">
                        <span>Code: {group.join_code}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {group.members ? group.members.length : 0}</span>
                    </CardFooter>
                    </Card>
                </Link>
                ))
            )}
          </div>

          {/* 👇 PAGINATION BUTTONS */}
          <div className="flex items-center justify-center gap-4 mt-8">
                <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrev} // Disabled if we are on Page 1
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <span className="text-sm font-medium">Page {page}</span>

                <Button 
                    variant="outline" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasNext} // Disabled if no more data
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}