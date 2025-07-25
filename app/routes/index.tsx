import { useRef, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchMovies } from "../api/omdb";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
const LAST_SEARCH_KEY = "lastSearchState";



export default function IndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const sessionCache = useRef<{ [key: string]: any[] }>({});

  
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(storedFavorites);
  }, []);

  // Save last search state to localStorage
  const saveLastSearchState = (query: string, results: any[]) => {
    if (typeof window === "undefined" || !window.localStorage) return;
    
    try {
      const lastSearchState = {
        query: query,
        results: results,
        timestamp: Date.now()
      };
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(lastSearchState));
    } catch (e) {
      console.error("Error saving last search state:", e);
    }
  };

  // Load last search state from localStorage
  const loadLastSearchState = () => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    
    try {
      const saved = localStorage.getItem(LAST_SEARCH_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing last search state:", e);
    }
    return null;
  };


  const fetchMovies = async (search: string) => {
    if (!search.trim()) {
      setResults([]);
      // Save empty state as well
      saveLastSearchState("", []);
      return;
    }

    if (sessionCache.current[search]) {
      setResults(sessionCache.current[search]);
      saveLastSearchState(search, sessionCache.current[search]);
      return;
    }

    const cached = (typeof window !== "undefined" && window.localStorage)
      ? localStorage.getItem(`searchCache-${search}`)
      : null;

    if (cached) {
      const parsed = JSON.parse(cached);
      setResults(parsed);
      sessionCache.current[search] = parsed;
      saveLastSearchState(search, parsed);
      return;
    }

    setLoading(true);
    const data = await searchMovies(search);
    if (data.Search) {
      const detailedResults = await Promise.all(
        data.Search.map(async (movie: any) => {
          const res = await fetch(`https://www.omdbapi.com/?apikey=b1c026c1&i=${movie.imdbID}`);
          return await res.json();
        })
      );
      setResults(detailedResults);
      sessionCache.current[search] = detailedResults;
      saveLastSearchState(search, detailedResults);
    } else {
      setResults([]);
      saveLastSearchState(search, []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const q = searchParams.get("q");
    
    // If there's a query in URL, use it
    if (q) {
      setQuery(q);
      fetchMovies(q);
    } else {
      // If no query in URL, try to load last search state
      const lastSearchState = loadLastSearchState();
      if (lastSearchState) {
        setQuery(lastSearchState.query);
        setResults(lastSearchState.results);
        // Update session cache as well
        if (lastSearchState.query) {
          sessionCache.current[lastSearchState.query] = lastSearchState.results;
        }
      }
    }
  }, [searchParams]);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
      fetchMovies(trimmed);
    } else {
      setSearchParams({});
      setResults([]);
      saveLastSearchState("", []);
    }
  };

   const isFavorite = (id: string): boolean => {
    return favorites.some((m) => m.imdbID === id);
  };

  const addToFavorites = async (movie: any) => {
    try {
      const alreadyExists = favorites.find((m: any) => m.imdbID === movie.imdbID);
      if (alreadyExists) {
        toast.error(`${movie.Title} is already in favorites!`);
        return;
      }

      const res = await fetch(`https://www.omdbapi.com/?apikey=b1c026c1&i=${movie.imdbID}`);
      const fullData = await res.json();

      const updated = [...favorites, fullData];
      localStorage.setItem("favorites", JSON.stringify(updated));
      setFavorites(updated); // ⬅️ update state
      toast.success(`${movie.Title} added to favorites!`);
    } catch (e) {
      console.error("Error adding to favorites:", e);
    }
  };

 const removeFromFavorites = (imdbID: string) => {
  try {
    const toRemove = favorites.find((m: any) => m.imdbID === imdbID);
    const updated = favorites.filter((m: any) => m.imdbID !== imdbID);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(updated);
    if (toRemove) {
      toast.info(`${toRemove.Title} removed from favorites.`);
    }
  } catch (e) {
    console.error("Error removing from favorites:", e);
  }
};


  return (
    <div className="w-full mx-auto py-5 px-4">
      <h1 className="text-2xl font-bold mb-4">Search Movies 🎥</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Enter movie title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white" />
        </button>
      </form>

      {loading && (
        <div className="flex justify-center items-center space-x-2 py-8">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
      )}


      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((movie) => (
         <div
  key={movie.imdbID}
  className="bg-gray-800 p-3 rounded shadow-md flex flex-col h-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
>

            <Link to={`/movies/${movie.imdbID}`} className="block mb-2">
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="w-full aspect-[2/3] object-cover rounded mb-2"
              />

              <h2 className="text-md font-semibold line-clamp-2 min-h-[3rem]">
                {movie.Title}
              </h2>
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>{movie.Year}</span>
                <span>⭐ {movie.imdbRating || "N/A"}</span>
              </div>
            </Link>

          {isFavorite(movie.imdbID) ? (
            <button
              onClick={() => removeFromFavorites(movie.imdbID)}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded"
            >
              <HeartIcon className="w-5 h-5 text-red-400" />
              Remove from Favorites
            </button>
          ) : (
            <button
              onClick={async () => await addToFavorites(movie)}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
            >
              <HeartIcon className="w-5 h-5" />
              Add to Favorites
            </button>  
          )}

          </div>
        ))}
      </div>

      {!loading && results.length === 0 && query && (
        <p className="text-gray-400 mt-4">No movies found.</p>
      )}
    </div>
  );
}