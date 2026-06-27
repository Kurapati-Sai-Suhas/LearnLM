import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  MessageSquare,
  Search,
  UserPlus,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import api, { userAPI } from "@/services/api";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type TabKey = "friends" | "pending" | "find";

function AvatarBlock({ online }: { online?: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className="h-10 w-10 rounded-full bg-slate-800 border border-border flex items-center justify-center">
        <User className="h-5 w-5 text-muted-foreground" />
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
            online ? "bg-emerald-500" : "bg-slate-600"
          }`}
        />
      )}
    </div>
  );
}

export default function Friends() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState<TabKey>("friends");
  
  // Data State
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Input State
  const [query, setQuery] = useState("");
  const [findQuery, setFindQuery] = useState("");
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (findQuery.length < 3) return;
    
    setIsSearching(true);
    setSearchError(""); 
    setSearchResults([]); 
    
    try {
      const res = await api.get(`/users/search/?q=${findQuery}`);
      if (res.data.users && res.data.users.length > 0) {
          setSearchResults(res.data.users);
      } else {
          setSearchError(`No users found matching "${findQuery}"`);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.error || "Backend error");
    } finally {
      setIsSearching(false);
    }
  };

  const sendRequest = async (userId: number) => {
    try {
      await api.post('/friends/request/', { receiver_id: userId });
      alert("Friend request sent! 🚀");
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      fetchFriends();
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

  const handleRemoveFriend = async (connectionId: number) => {
    try {
      await api.delete(`/friends/request/${connectionId}/`);
      fetchFriends();
    } catch (err) {
      alert("Failed to remove friend.");
    }
  };

  const filteredFriends = friends.filter((conn) => {
    const f = conn.sender.id === currentUser?.id ? conn.receiver : conn.sender;
    return f.username.toLowerCase().includes(query.toLowerCase());
  });

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: "friends", label: "My Friends",  count: friends.length },
    { key: "pending", label: "Pending",     count: pendingRequests.length },
    { key: "find",    label: "Find Friends" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Your Network
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your study connections and discover new peers.
          </p>
        </header>

        {/* TABS */}
        <div className="border-b border-border mb-6">
          <nav className="flex items-center gap-1" role="tablist">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  className={`relative px-3 py-2.5 text-sm font-medium ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {t.label}
                    {typeof t.count === "number" && (
                      <span
                        className={`inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-md text-[11px] font-medium ${
                          active
                            ? "bg-primary/15 text-primary"
                            : "bg-slate-900 text-muted-foreground border border-border"
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </span>
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-px h-px bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PANEL: MY FRIENDS */}
        {tab === "friends" && (
          <div role="tabpanel">
            {/* Inline search */}
            <div className="flex items-center gap-2 h-10 px-3 mb-4 rounded-md bg-slate-900 border border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter your friends"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="border border-border rounded-lg bg-slate-950/40 divide-y divide-border">
              {filteredFriends.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No friends match that filter.
                </div>
              ) : (
                filteredFriends.map((conn) => {
                  const f = conn.sender.id === currentUser?.id ? conn.receiver : conn.sender;
                  return (
                    <div
                      key={conn.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/50"
                    >
                      <Link to={`/chat`}>
                        <AvatarBlock online={true} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={`/chat`} className="text-sm font-medium text-foreground truncate hover:underline">
                            {f.username}
                          </Link>
                        </div>
                        <p className="text-xs text-emerald-500 font-medium truncate mt-0.5">
                          Connected
                        </p>
                      </div>

                      <Link to="/chat" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-blue-600 transition-colors">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Link>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="More options"
                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-800 border border-transparent hover:border-border transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-foreground">
                          <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-slate-800 cursor-pointer" onClick={() => handleRemoveFriend(conn.id)}>
                            Remove Friend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer focus:bg-slate-800">
                            Mute Notifications
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* PANEL: PENDING */}
        {tab === "pending" && (
          <div role="tabpanel">
            {pendingRequests.length === 0 ? (
              <div className="border border-border rounded-lg px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No pending requests.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-lg bg-slate-950/40 divide-y divide-border">
                {pendingRequests.map((conn) => {
                  const isIncoming = conn.receiver.id === currentUser?.id;
                  const otherUser = isIncoming ? conn.sender : conn.receiver;
                  return (
                    <div
                      key={conn.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/50"
                    >
                      <AvatarBlock />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {otherUser.username}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isIncoming
                            ? "wants to connect"
                            : "Request sent · awaiting reply"}
                        </p>
                      </div>

                      {isIncoming ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAction(conn.id, 'accept')} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-blue-600 transition-colors">
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </button>
                          <button onClick={() => handleAction(conn.id, 'reject')} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border border-border hover:bg-slate-900 transition-colors">
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border border-border hover:bg-slate-900 transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PANEL: FIND FRIENDS */}
        {tab === "find" && (
          <div role="tabpanel">
            <div className="border border-border rounded-lg p-5 bg-slate-950/40 mb-6">
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Search by name or handle
              </label>
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-md bg-slate-900 border border-border">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={findQuery}
                    onChange={(e) => setFindQuery(e.target.value)}
                    placeholder="e.g. Suhas or Venkat"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </form>

              <p className="mt-4 text-xs text-muted-foreground">
                Tip: You can search by full name, partial name, or username.
                Results will appear below once you search.
              </p>
            </div>

            {/* Results state */}
            {searchError ? (
              <div className="border border-dashed border-border rounded-lg px-4 py-12 text-center text-red-400">
                <p className="text-sm">{searchError}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="border border-border rounded-lg bg-slate-950/40 divide-y divide-border">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/50"
                  >
                    <AvatarBlock />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => sendRequest(user.id)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-primary hover:text-primary-foreground bg-transparent border border-primary hover:bg-primary transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 border border-dashed border-border rounded-lg px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {findQuery.trim()
                    ? `Press Search to find people matching "${findQuery.trim()}".`
                    : "Start typing above to discover new peers."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}