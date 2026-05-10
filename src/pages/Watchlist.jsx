import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../hooks/useAuth";
import { getWatchlist, removeFromWatchlist } from "../services/watchlistService";
import { User, Clock, Heart, Bell, Download, Settings, ChevronDown, Check, Play, Tv } from "lucide-react";
import { addToWatchlist } from "../services/watchlistService";

export default function Watchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("All");
  const [openStatusPicker, setOpenStatusPicker] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const navItems = [
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "watching", label: "Continue Watching", icon: Clock, path: "/watching" },
    { id: "bookmarks", label: "Bookmarks", icon: Heart, path: "/watchlist" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "import", label: "Import/Export", icon: Download, path: "/import" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  const subTabs = ["All", "Watching", "On-Hold", "Planning", "Completed", "Dropped"];

  useEffect(() => {
    if (!user) {
      navigate("/"); // Redirect to home if not logged in
      return;
    }

    const fetchWatchlist = async () => {
      const res = await getWatchlist();
      if (res.success) {
        setWatchlist(res.watchlist);
      }
      setIsLoading(false);
    };

    fetchWatchlist();
  }, [user, navigate]);

  const handleRemove = async (animeId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const res = await removeFromWatchlist(animeId);
    if (res.success) {
      setWatchlist(res.watchlist);
    }
  };

  const handleUpdateStatus = async (item, newStatus, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUpdating || item.status === newStatus) {
      setOpenStatusPicker(null);
      return;
    }

    setIsUpdating(true);
    const res = await addToWatchlist(item.animeId, item.title, item.coverImage, newStatus);
    if (res.success) {
      setWatchlist(res.watchlist);
    }
    setIsUpdating(false);
    setOpenStatusPicker(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenStatusPicker(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen text-white bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const filteredWatchlist = watchlist.filter(item => activeTab === "All" || item.status === activeTab);

  return (
    <div className="min-h-screen text-white bg-[#0a0a0a] flex flex-col font-sans selection:bg-red-500/30">
      <Navbar />

      <div className="w-full pt-[80px] px-4 md:px-8 pb-12 max-w-[1600px] mx-auto flex-1">
        
        {/* Compact Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 w-full max-w-4xl mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.id === "bookmarks" && location.pathname === "/watchlist");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border ${
                  isActive 
                  ? "bg-red-600 text-white border-red-600" 
                  : "bg-white/[0.02] border-white/5 text-white/30 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                <span className="hidden md:block text-[12px] font-bold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-colors ${
                activeTab === tab 
                ? "bg-white text-black border border-white" 
                : "bg-[#161616] text-white/40 border border-white/5 hover:bg-[#1f1f1f] hover:text-white/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredWatchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#111] border border-white/5 rounded-2xl shadow-xl relative overflow-hidden max-w-3xl mx-auto">
            <div className="relative w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Heart size={32} className="text-white/20" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
              {activeTab === "All" ? "Collection Empty" : `No ${activeTab} Anime`}
            </h2>
            <p className="text-white/30 mb-8 text-[13px] max-w-xs text-center leading-relaxed">
              Discover new shows and add them to your collection to keep track of your journey!
            </p>
            <Link to="/browse" className="bg-white text-black font-black py-3 px-8 rounded-xl text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95">
              Browse Anime
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-x-4 gap-y-4">
            {filteredWatchlist.map((item) => {
              const timeQuery = item.currentTime ? `&t=${item.currentTime}` : "";
              const watchUrl = `/watch/${item.animeId}?ep=${item.progress || 1}${timeQuery}`;

              return (
                <div key={item.animeId} className="group relative flex bg-[#16171B] hover:bg-[#1C1E23] rounded-[4px] transition-colors duration-300 h-[100px] sm:h-[120px]">
                  
                  {/* Poster */}
                  <Link to={watchUrl} className="shrink-0 w-[70px] sm:w-[85px] h-full relative overflow-hidden rounded-l-[4px]">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#111] text-white/10 text-[10px] font-black uppercase tracking-widest text-center">No Cover</div>
                    )}
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play size={20} className="text-white ml-1 shadow-lg" fill="currentColor" />
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex flex-col justify-between p-3 sm:p-4 flex-1 min-w-0 relative">
                    
                    {/* Top Row: Title & Dropdown */}
                    <div className="flex justify-between items-start gap-4">
                      <Link to={watchUrl} className="font-medium text-[13px] sm:text-[14px] text-white/90 group-hover:text-red-500 transition-colors line-clamp-2 pr-2 leading-snug tracking-wide">
                        {item.title}
                      </Link>
                      
                      {/* Status Dropdown */}
                      <div 
                        className="relative shrink-0" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenStatusPicker(openStatusPicker === item.animeId ? null : item.animeId);
                        }}
                      >
                        <button className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer capitalize">
                          {item.status || "Planning"}
                          <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-300 ${openStatusPicker === item.animeId ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {openStatusPicker === item.animeId && (
                          <div className="absolute top-full right-0 mt-2 bg-[#1a1c21] border border-white/10 rounded-md shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden min-w-[140px] z-50 animate-in fade-in zoom-in-95 duration-200">
                            {subTabs.filter(t => t !== "All").map((tab) => (
                              <button
                                key={tab}
                                onClick={(e) => handleUpdateStatus(item, tab, e)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-[11px] transition-colors ${
                                  item.status === tab ? "bg-white/5 text-white font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                {tab}
                                {item.status === tab && <Check size={14} className="text-white" />}
                              </button>
                            ))}
                            {/* Remove Option */}
                            <div className="border-t border-white/5 mt-1 pt-1">
                              <button
                                onClick={(e) => { handleRemove(item.animeId, e); setOpenStatusPicker(null); }}
                                className="w-full text-left px-3 py-2.5 text-[11px] text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                Remove from List
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Meta Data */}
                    <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-bold tracking-wider text-white/40">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                        <Tv size={12} className="opacity-70" />
                        <span>EP {item.progress || 1}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
