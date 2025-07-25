import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HeartIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const location = useLocation();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("/");

  // Menyimpan halaman terakhir jika bukan detail movie
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/favorites" && !location.pathname.startsWith("/movie/")) return;

    localStorage.setItem("lastMenu", location.pathname);
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  // Ambil data aktif terakhir kalau di halaman movie/:id
  useEffect(() => {
    if (location.pathname.startsWith("/movie/")) {
      const last = localStorage.getItem("lastMenu") || "/";
      setActiveMenu(last);
    }
  }, [location.pathname]);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;

    const updateFavoritesCount = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavoritesCount(favorites.length);
      } catch (e) {
        console.error("Error reading favorites:", e);
        setFavoritesCount(0);
      }
    };

    updateFavoritesCount();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "favorites") updateFavoritesCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", updateFavoritesCount);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", updateFavoritesCount);
    };
  }, [isClient]);

  const isActive = (path: string) => activeMenu === path;

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

          {/* Mobile toggle button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-blue-400 focus:outline-none"
            >
              {menuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <NavLinks
              isActive={isActive}
              favoritesCount={favoritesCount}
              isClient={isClient}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-2 pb-4">
            <NavLinks
              isActive={isActive}
              favoritesCount={favoritesCount}
              isClient={isClient}
              isMobile
            />
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLinks({
  isActive,
  favoritesCount,
  isClient,
  isMobile = false,
}: {
  isActive: (path: string) => boolean;
  favoritesCount: number;
  isClient: boolean;
  isMobile?: boolean;
}) {
  const baseStyle =
    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors w-full";

  const containerClass = isMobile ? "block" : "flex space-x-4";

  return (
    <div className={containerClass}>
      <Link
        to="/"
        className={`${baseStyle} ${
          isActive("/") ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
        Search
      </Link>

      <Link
        to="/favorites"
        className={`${baseStyle} relative ${
          isActive("/favorites") ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
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
  );
}
