import { useRef, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchMovies } from "../api/omdb";
import { MagnifyingGlassIcon, HeartIcon, PhotoIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

const LAST_SEARCH_KEY = "lastSearchState";

export default function IndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [errorPosters, setErrorPosters] = useState<string[]>([]);
  const sessionCache = useRef<{ [key: string]: any[] }>({});

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(storedFavorites);
  }, []);

  const saveLastSearchState = (query: string, results: any[]) => {
    try {
      const lastSearchState = {
        query,
        results,
        timestamp: Date.now(),
      };
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(lastSearchState));
    } catch (e) {
      console.error("Error saving last search state:", e);
    }
  };

  const loadLastSearchState = () => {
    try {
      const saved = localStorage.getItem(LAST_SEARCH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading last search state:", e);
    }
    return null;
  };

  const fetchMovies = async (search: string) => {
    if (!search.trim()) {
      setResults([]);
      saveLastSearchState("", []);
      return;
    }

    if (sessionCache.current[search]) {
      setResults(sessionCache.current[search]);
      saveLastSearchState(search, sessionCache.current[search]);
      return;
    }

    const cached = localStorage.getItem(`searchCache-${search}`);
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
    if (q) {
      setQuery(q);
      fetchMovies(q);
    } else {
      const last = loadLastSearchState();
      if (last) {
        setQuery(last.query);
        setResults(last.results);
        sessionCache.current[last.query] = last.results;
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
      if (isFavorite(movie.imdbID)) {
        toast.error(`${movie.Title} is already in favorites!`);
        return;
      }

      const res = await fetch(`https://www.omdbapi.com/?apikey=b1c026c1&i=${movie.imdbID}`);
      const fullData = await res.json();
      const updated = [...favorites, fullData];
      localStorage.setItem("favorites", JSON.stringify(updated));
      setFavorites(updated);
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
      if (toRemove) toast.info(`${toRemove.Title} removed from favorites.`);
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
        {results.map((movie) => {
          const isBrokenPoster =
            !movie.Poster ||
            movie.Poster.trim().toUpperCase() === "N/A" ||
            movie.Poster.trim() === "" ||
            errorPosters.includes(movie.imdbID);

          return (
            <div
              key={movie.imdbID}
              className="bg-gray-800 p-3 rounded shadow-md flex flex-col h-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Link to={`/movies/${movie.imdbID}`} className="block mb-2">
               {isBrokenPoster ? (
                <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-gray-700 rounded mb-2 p-2 text-center">
                  <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">Poster not available</p>
                </div>
              ) : (
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="w-full aspect-[2/3] object-cover rounded mb-2"
                  onError={() =>
                    setErrorPosters((prev) =>
                      prev.includes(movie.imdbID) ? prev : [...prev, movie.imdbID]
                    )
                  }
                />
              )}


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
          );
        })}
      </div>

      {!loading && results.length === 0 && query && (
        <p className="text-gray-400 mt-4">No movies found.</p>
      )}
    </div>
  );
}
