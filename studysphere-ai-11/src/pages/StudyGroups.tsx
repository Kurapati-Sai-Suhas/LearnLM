import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, LogIn, ChevronLeft, ChevronRight, AlertCircle, Shield, ArrowRight } from "lucide-react"; 
import api, { groupsAPI } from "@/services/api"; 

export default function StudyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Inputs
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupCode, setNewGroupCode] = useState("");
  const [newGroupCapacity, setNewGroupCapacity] = useState(10);
  const [joinCode, setJoinCode] = useState("");

  const fetchGroups = async (pageNum: number) => {
    setLoading(true);
    setError(""); 
    try {
      const response = await api.get('groups/', { params: { page: pageNum } });
      const data = response.data;
      setGroups(data.results || []);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

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
      setNewGroupName(""); setNewGroupDesc(""); setNewGroupCode(""); setNewGroupCapacity(10);
      setPage(1); fetchGroups(1); 
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

  if (loading && groups.length === 0) return (
      <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
  );

  return (
    <div className="space-y-8 p-6 md:p-8 animate-in fade-in max-w-7xl mx-auto w-full">
      
      {/* 🚀 Centered Hero Header without Star */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
              Study Groups
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
              Collaborate with your peers, share study materials, and conquer your exams together.
          </p>
      </div>

      {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 border border-red-200 dark:border-red-800 shadow-sm">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
              <Button variant="outline" size="sm" className="ml-auto bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/50" onClick={() => fetchGroups(page)}>Retry</Button>
          </div>
      )}

      <div className="grid gap-8 md:grid-cols-12">
        {/* LEFT COLUMN: Modern Control Panel */}
        <div className="md:col-span-4 lg:col-span-3">
          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 sticky top-6">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/80 border-b dark:border-slate-700 pb-4 rounded-t-xl">
                <CardTitle className="text-lg text-slate-800 dark:text-white">Group Menu</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="join">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  <TabsTrigger value="join" className="rounded-md dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">Join</TabsTrigger>
                  <TabsTrigger value="create" className="rounded-md dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">Create</TabsTrigger>
                </TabsList>

                <TabsContent value="join" className="space-y-4 animate-in slide-in-from-left-2">
                  <div className="space-y-3">
                    <Label className="text-slate-600 dark:text-slate-300">Enter Access Code</Label>
                    <div className="flex gap-2">
                        <Input placeholder="e.g. CS101" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="bg-slate-50 dark:bg-slate-900 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 dark:text-white" />
                        <Button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <LogIn className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-4 animate-in slide-in-from-right-2">
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <Label className="text-slate-600 dark:text-slate-300">Group Name</Label>
                        <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="e.g. Data Structures" required className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div>
                        <Label className="text-slate-600 dark:text-slate-300">Description</Label>
                        <Input value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} placeholder="What's this group about?" required className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-slate-600 dark:text-slate-300">Secret Code</Label>
                            <Input value={newGroupCode} onChange={(e) => setNewGroupCode(e.target.value)} placeholder="e.g. pass123" required className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div>
                            <Label className="text-slate-600 dark:text-slate-300">Capacity</Label>
                            <Input type="number" min={1} value={newGroupCapacity} onChange={(e) => setNewGroupCapacity(Number(e.target.value))} required className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md mt-2">Create Group</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Catchy Grid List */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-start">
          
          {/* NEW HEADER TO EXPLAIN WHY ALL GROUPS ARE HERE */}
          <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
             <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                 🌍 Explore Public Groups
             </h2>
             <p className="text-slate-500 dark:text-slate-400 mt-1">
                 These are all the groups created across the platform. Join one using an access code!
             </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {groups.length === 0 && !error ? (
                <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500">
                    <Users className="h-12 w-12 mb-4 opacity-50"/>
                    <p className="text-lg font-medium">No groups found.</p>
                    <p className="text-sm">Create or join one from the menu!</p>
                </div>
            ) : (
                groups.map((group: any) => (
                <Link to={`/groups/${group.id}`} key={group.id} className="group">
                    <Card className="h-full border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-800">
                        {/* Cool Top Accent Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform origin-left transition-transform duration-300"></div>
                        
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="truncate font-bold text-xl text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {group.name}
                                </CardTitle>
                                <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                                    <Users className="w-3 h-3"/>
                                    {group.members ? group.members.length : 0} / {group.capacity || 10}
                                </div>
                            </div>
                            <CardDescription className="line-clamp-2 text-slate-500 dark:text-slate-400 mt-2 h-10">
                                {group.description}
                            </CardDescription>
                        </CardHeader>
                        
                        <CardFooter className="pt-4 pb-4 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80 mt-auto">
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border dark:border-slate-700 shadow-sm">
                                <Shield className="w-3 h-3 text-emerald-500"/>
                                {group.join_code}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                <ArrowRight className="w-4 h-4"/>
                            </div>
                        </CardFooter>
                    </Card>
                </Link>
                ))
            )}
          </div>

          {/* PAGINATION BUTTONS */}
          <div className="flex items-center justify-center gap-6 mt-10 w-full">
                <Button 
                    variant="outline" 
                    className="border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrev} 
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner">
                    Page {page}
                </div>

                <Button 
                    variant="outline" 
                    className="border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasNext} 
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