// save api key
const API_KEY = 'b1c026c1';
// OMDb API endpoint for movie data
export async function searchMovies(query: string) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
  return res.json();
}

export async function getMovieDetail(id: string) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
  return res.json();
}
