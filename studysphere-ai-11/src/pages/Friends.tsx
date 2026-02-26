import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Check, X, MessageCircle, Clock, Users, UserMinus } from "lucide-react";
import api, { userAPI } from "@/services/api";

export default function Friends() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await userAPI.getProfile();
        setCurrentUser(profileRes.data);
        await fetchFriends();
      } catch (err) {
        console.error("Failed to load friends data", err);
      }
    };
    loadData();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends/');
      setPendingRequests(res.data.pending || []);
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error("Error fetching friends", err);
    }
  };

  // 👇 THE FIX: Uses your perfectly configured `api` instance instead of hardcoded Axios
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 3) return;
    
    setIsSearching(true);
    setSearchError(""); 
    setSearchResults([]); 
    
    try {
      const res = await api.get(`/users/search/?q=${searchQuery}`);

      if (res.data.users && res.data.users.length > 0) {
          setSearchResults(res.data.users);
      } else {
          setSearchError(`No users found matching "${searchQuery}"`);
      }
    } catch (err: any) {
      console.error("Search failed", err);
      setSearchError(err.response?.data?.error || "Backend error: Check Django terminal!");
    } finally {
      setIsSearching(false);
    }
  };

  const sendRequest = async (userId: number) => {
    try {
      await api.post('/friends/request/', { receiver_id: userId });
      alert("Friend request sent! 🚀");
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send request.");
    }
  };

  const handleAction = async (connectionId: number, action: 'accept' | 'reject') => {
    try {
      await api.post(`/friends/request/${connectionId}/action/`, { action });
      fetchFriends(); 
    } catch (err) {
      alert(`Failed to ${action} request.`);
    }
  };

  const cardClass = "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all";

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full p-6 md:p-8 pb-10 animate-in fade-in duration-500">
      
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl flex flex-col items-center text-center">
        <Users className="h-12 w-12 mb-4 opacity-90" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Your Network</h1>
        <p className="text-blue-100 text-lg max-w-xl">
            Connect with classmates, share knowledge, and dominate your exams together.
        </p>
      </div>

      <Tabs defaultValue="network" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <TabsTrigger value="network" className="rounded-lg dark:data-[state=active]:bg-slate-800">My Friends</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg dark:data-[state=active]:bg-slate-800">
            Pending <span className="ml-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="rounded-lg dark:data-[state=active]:bg-slate-800">Find Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                    <UserMinus className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>You haven't added any friends yet.</p>
                </div>
            ) : (
                friends.map((conn) => {
                    const friend = conn.sender.id === currentUser?.id ? conn.receiver : conn.sender;
                    return (
                        <Card key={conn.id} className={`${cardClass} flex items-center p-4`}>
                            <Avatar className="h-12 w-12 border-2 border-blue-100 dark:border-slate-700 shrink-0">
                                <AvatarFallback className="bg-blue-600 text-white font-bold">
                                    {friend.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 flex-1 truncate">
                                <h3 className="font-bold text-slate-800 dark:text-white truncate">{friend.username}</h3>
                                <p className="text-xs text-emerald-500 font-medium">Connected</p>
                            </div>
                            <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-400 shrink-0 shadow-sm">
                                <MessageCircle className="h-4 w-4 mr-2" /> Message
                            </Button>
                        </Card>
                    );
                })
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No pending friend requests.</p>
                </div>
            ) : (
                pendingRequests.map((conn) => (
                    <Card key={conn.id} className={`${cardClass} flex items-center p-4`}>
                        <Avatar className="h-12 w-12 border-2 border-amber-100 dark:border-slate-700 shrink-0">
                            <AvatarFallback className="bg-amber-500 text-white font-bold">
                                {conn.sender.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1 truncate">
                            <h3 className="font-bold text-slate-800 dark:text-white truncate">{conn.sender.username}</h3>
                            <p className="text-xs text-amber-500 font-medium">Wants to connect</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button size="icon" onClick={() => handleAction(conn.id, 'accept')} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-sm">
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => handleAction(conn.id, 'reject')} className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/30 rounded-full shadow-sm">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card className={`${cardClass} p-6`}>
              <form onSubmit={handleSearch} className="flex gap-3">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                          placeholder="Search for a classmate's username (min 3 letters)..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-12 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 text-lg rounded-xl"
                      />
                  </div>
                  <Button type="submit" disabled={isSearching || searchQuery.length < 3} className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md text-white">
                      {isSearching ? "Searching..." : "Find"}
                  </Button>
              </form>

              {searchError && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-center font-medium">
                      {searchError}
                  </div>
              )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((user) => (
                  <Card key={user.id} className={`${cardClass} flex items-center p-4`}>
                      <Avatar className="h-12 w-12 border-2 border-indigo-100 dark:border-slate-700 shrink-0">
                          <AvatarFallback className="bg-indigo-600 text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex-1 truncate">
                          <h3 className="font-bold text-slate-800 dark:text-white truncate">{user.username}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Student</p>
                      </div>
                      <Button onClick={() => sendRequest(user.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-sm rounded-lg">
                          <UserPlus className="h-4 w-4 mr-2" /> Add
                      </Button>
                  </Card>
              ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}