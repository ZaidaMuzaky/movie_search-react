import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HeartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function Navbar() {
  const location = useLocation();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update favorites count when client-side
  useEffect(() => {
    if (!isClient) return;
    
    const updateFavoritesCount = () => {
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
          setFavoritesCount(favorites.length);
        } catch (e) {
          console.error("Error reading favorites:", e);
          setFavoritesCount(0);
        }
      }
    };

    updateFavoritesCount();

    // Listen for storage changes (when user adds/removes favorites)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "favorites") {
        updateFavoritesCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also update on focus (in case user added favorites in another tab)
    window.addEventListener("focus", updateFavoritesCount);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", updateFavoritesCount);
    };
  }, [isClient]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            🎬 MovieSearch
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              Search
            </Link>

            <Link
              to="/favorites"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                isActive("/favorites")
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <HeartIcon className="w-4 h-4 mr-2" />
              Favorites
              {isClient && favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}