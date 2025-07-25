# 🎬 MovieSearch App

A responsive web application that allows users to search for movies, view detailed information, and manage their favorites — built with **React Router 7 (Framework Mode)**, **TypeScript**, and **TailwindCSS**.

---

## ✅ Features

- 🔍 **Search Movies** by title using [OMDb API](https://www.omdbapi.com/)
- 📄 **Display Search Results** in responsive grid
- 🎥 **Movie Detail View** with full poster and description
- ❤️ **Favorites System** saved via `localStorage`
- 🌙 **Responsive Design** with mobile support and animated menu
- 🔔 **User Feedback** using toast notifications
- 🧭 **Menu Tracking** based on last visited tab (Search/Favorites)

---

## 📦 Tech Stack

| Feature | Technology |
|--------|-------------|
| UI | React 19, TailwindCSS |
| Routing | React Router v7 (Framework Mode) |
| Language | TypeScript |
| Toast | [Sonner](https://github.com/emilkowalski/sonner) (MIT License) |
| Icons | [Heroicons](https://heroicons.com) (MIT License) |
| Build Tool | Vite |
| Deployment Ready | ✅ |

---

## 🧠 Approach 
This app is built with React 19 and React Router 7 using Framework Mode to handle smooth navigation between the Search and Favorites pages. Development is powered by Vite for fast build times, and TailwindCSS is used for clean, responsive styling.

Movies are fetched from the OMDb API only when the user manually submits a search, helping to avoid unnecessary API requests and stay within the daily limit (1,000 calls/day). Results are cached both in-memory (via useRef) and in localStorage to minimize repeat fetches and improve user experience.

Favorite movies are stored in localStorage and kept in sync with app state to ensure the UI updates instantly. For the interface, I used Heroicons for modern icons and Sonner to show toast notifications. All libraries used are open-source (MIT or Apache-licensed).

---

## 🛡 License Info

All third-party libraries used are under **MIT** or **Apache 2.0 License**, including:

- `react`, `react-dom`
- `react-router`, `@react-router/dev`
- `tailwindcss`
- `vite`
- `sonner`, `heroicons`

✔️ **Complies with Only free-licensed libraries used**

---

## 🚀 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/ZaidaMuzaky/movie_search-react.git
cd movie_search-react

# Install dependencies
npm install

# Start the development server
npm run dev
