import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/solid"; // pastikan sudah install @heroicons/react

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const removeFromFavorites = (id: string) => {
    const updated = favorites.filter((movie) => movie.imdbID !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="w-full mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Favorite Movies ❤️</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-400">No favorites added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-gray-800 p-3 rounded shadow-md flex flex-col h-full"
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

              <button
                onClick={() => removeFromFavorites(movie.imdbID)}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
              >
                <TrashIcon className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
