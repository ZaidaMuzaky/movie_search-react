import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner"; 
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/solid";


export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const [hasImageError, setHasImageError] = useState(false);


  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      const res = await fetch(`https://www.omdbapi.com/?apikey=b1c026c1&i=${id}&plot=full`);
      const data = await res.json();
      setMovie(data);
      setLoading(false);
    };
    fetchMovie();
  }, [id]);

  // Cek apakah movie sudah ada di localStorage favorite
  useEffect(() => {
    if (movie) {
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      const exists = favs.some((m: any) => m.imdbID === movie.imdbID);
      setIsFavorite(exists);
    }
  }, [movie]);

  const handleToggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const exists = favs.find((m: any) => m.imdbID === movie.imdbID);

    if (exists) {
      const updated = favs.filter((m: any) => m.imdbID !== movie.imdbID);
      localStorage.setItem("favorites", JSON.stringify(updated));
      setIsFavorite(false);
      toast.success(`Removed "${movie.Title}" from favorites`);
    } else {
      localStorage.setItem("favorites", JSON.stringify([...favs, movie]));
      setIsFavorite(true);
      toast.success(`Added "${movie.Title}" to favorites`);
    }
  };

  if (loading) return <p className="text-gray-400 text-center">Loading movie details...</p>;
  if (!movie || movie.Response === "False") return <p className="text-red-500 text-center">Movie not found.</p>;

  return (
    <div className="max-w-5xl mx-auto py-2 px-4 text-white">
         <div className="mb-4">
        <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-base bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition"
>
  <ArrowLeftIcon className="w-5 h-5" />
  Back
</button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Poster + Button Favorite */}
        <div className="w-full md:w-64 flex flex-col items-center gap-4">
          {!movie.Poster || movie.Poster === "N/A" || hasImageError ? (
            <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-gray-700 rounded shadow p-4 text-center">
              <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">Poster not available</p>
            </div>
          ) : (
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="w-full aspect-[2/3] object-cover rounded shadow"
              onError={() => setHasImageError(true)}
            />
          )}


          <button
            onClick={handleToggleFavorite}
            className={`w-full px-4 py-2 rounded text-white ${
              isFavorite ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isFavorite ? "💔 Remove from Favorites" : "❤️ Add to Favorites"}
          </button>
        </div>

        {/* Movie Info */}
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{movie.Title}</h1>
          <p className="text-gray-400">
            {movie.Year} • {movie.Runtime} • {movie.Country}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {movie.Genre.split(", ").map((genre: string) => (
              <span
                key={genre}
                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-200">{movie.Plot}</p>

          <div className="space-y-2 mt-6 bg-white/5 p-4 rounded-lg backdrop-blur-sm">
            {[
                { label: "Director", value: movie.Director },
                { label: "Actors", value: movie.Actors },
                { label: "Language", value: movie.Language },
                { label: "Awards", value: movie.Awards },
                { label: "IMDB Rating", value: movie.imdbRating ? `⭐ ${movie.imdbRating}` : null },
                { label: "Rated", value: movie.Rated },
                { label: "Type", value: movie.Type },
                { label: "Production", value: movie.Production },
                { label: "Box Office", value: movie.BoxOffice },
            ].map((item) => (
                <div
                key={item.label}
                className="grid grid-cols-[auto,1fr] gap-x-2 items-start"
                >
                <span className="text-blue-400 font-semibold whitespace-nowrap">
                    {item.label}:
                </span>
                <span className="text-white">{item.value ? item.value : "N/A"}</span>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
}
