import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("favorites", "routes/favorites.tsx"),
   route("movies/:id", "routes/movies/$id.tsx"),
] satisfies RouteConfig;
