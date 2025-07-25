import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PhotoIcon } from "@heroicons/react/24/outline"; 

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorPosters, setErrorPosters] = useState<string[]>([]); 

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const handleRemoveClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmRemove = () => {
    if (confirmDeleteId) {
      const updated = favorites.filter((movie) => movie.imdbID !== confirmDeleteId);
      setFavorites(updated);
      localStorage.setItem("favorites", JSON.stringify(updated));
      setConfirmDeleteId(null);
    }
  };

  const cancelRemove = () => {
    setConfirmDeleteId(null);
  };

  const movieToDelete = favorites.find((movie) => movie.imdbID === confirmDeleteId);

  const isPosterBroken = (movie: any) =>
    !movie.Poster || movie.Poster === "N/A" || errorPosters.includes(movie.imdbID);

  return (
    <div className="w-full mx-auto py-5 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Favorite Movies ❤️</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-400">No favorites added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-gray-800 p-3 rounded shadow-md flex flex-col h-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Link to={`/movies/${movie.imdbID}`} className="block mb-2">
                {isPosterBroken(movie) ? (
                  <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-gray-700 rounded mb-2">
                    <PhotoIcon className="h-10 w-10 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Poster not available</span>
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

              <button
                onClick={() => handleRemoveClick(movie.imdbID)}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
              >
                <TrashIcon className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Popup */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Are you sure you want to remove{" "}
              <span className="font-bold text-red-600">
                {movieToDelete?.Title}
              </span>{" "}
              from favorites?
            </h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
