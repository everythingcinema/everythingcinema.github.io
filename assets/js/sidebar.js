"use strict";

import { api_key, fetchDataFromServer } from "./api.js";

export function sidebar() {
  const movieGenres = {};
  const tvGenres = {};

  fetchDataFromServer(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`,
    ({ genres }) => {
      for (const { id, name } of genres) {
        movieGenres[id] = name;
      }
      createMovieGenreLinks();
    }
  );

  fetchDataFromServer(
    `https://api.themoviedb.org/3/genre/tv/list?api_key=${api_key}`,
    ({ genres }) => {
      for (const { id, name } of genres) {
        tvGenres[id] = name;
      }
      createTvGenreLinks();
    }
  );

  const sidebarInner = document.createElement("div");
  sidebarInner.classList.add("sidebar-inner");

  sidebarInner.innerHTML = `
    <div class="sidebar-list">
      <p class="title">Movie Genres</p>
    </div>
    <div class="sidebar-list">
      <p class="title">TV Show Genres</p>
    </div>
    <div class="sidebar-list">
      <p class="title">Language</p>
      <a href="./movie-list.html" menu-close class="sidebar-link"
        onclick='getMovieList("with_original_language=en", "English")'>English</a>
      <a href="./movie-list.html" menu-close class="sidebar-link"
        onclick='getMovieList("with_original_language=zh", "Mandarin")'>Mandarin</a>
    </div>
    <div class="sidebar-footer">
      <p class="copyright">&copy; Everything Cinema</p>
      <div class="social-media-icons">
        <a href="https://www.tiktok.com" target="_blank" class="social-icon"><i class="fab fa-tiktok"></i></a>
        <a href="https://www.instagram.com" target="_blank" class="social-icon"><i class="fab fa-instagram"></i></a>
        <a href="https://www.facebook.com" target="_blank" class="social-icon"><i class="fab fa-facebook-f"></i></a>
        <a href="https://www.youtube.com" target="_blank" class="social-icon"><i class="fab fa-youtube"></i></a>
      </div>
    </div>
  `;

  function createMovieGenreLinks() {
    const movieGenreListElem = sidebarInner.querySelectorAll(".sidebar-list")[0];
    for (const [genreId, genreName] of Object.entries(movieGenres)) {
      const link = document.createElement("a");
      link.classList.add("sidebar-link");
      link.href = "./movie-list.html";
      link.setAttribute("menu-close", "");
      link.dataset.genreId = genreId;
      link.dataset.genreName = genreName;
      link.textContent = genreName;
      movieGenreListElem.appendChild(link);
    }
  }

  function createTvGenreLinks() {
    const tvGenreListElem = sidebarInner.querySelectorAll(".sidebar-list")[1];
    for (const [genreId, genreName] of Object.entries(tvGenres)) {
      const link = document.createElement("a");
      link.classList.add("sidebar-link");
      link.href = "./tv-show-list.html";
      link.setAttribute("menu-close", "");
      link.dataset.genreId = genreId;
      link.dataset.genreName = genreName;
      link.textContent = genreName;
      tvGenreListElem.appendChild(link);
    }

    const sidebar = document.querySelector("[sidebar]");
    sidebar.appendChild(sidebarInner);
    toggleSidebar(sidebar);
  }

  function toggleSidebar(sidebar) {
    const sidebarBtn = document.querySelector("[menu-btn]");
    const sidebarTogglers = document.querySelectorAll("[menu-toggler]");
    const sidebarClose = document.querySelectorAll("[menu-close]");
    const overlay = document.querySelector("[overlay]");

    sidebarTogglers.forEach(elem => elem.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      sidebarBtn.classList.toggle("active");
      overlay.classList.toggle("active");
    }));

    sidebarClose.forEach(elem => elem.addEventListener("click", () => {
      sidebar.classList.remove("active");
      sidebarBtn.classList.remove("active");
      overlay.classList.remove("active");
    }));
  }

  // Function to Highlight Selected Genre
  function highlightSelectedGenre() {
    const genreLinks = document.querySelectorAll(".sidebar-link");
    const selectedGenre = localStorage.getItem("genreName");

    genreLinks.forEach(link => {
      if (link.dataset.genreName === selectedGenre) {
        link.classList.add("selected-genre");
      } else {
        link.classList.remove("selected-genre");
      }
    });
  }

  // Event Listener to Store Genre ID in Local Storage & Highlight It
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("sidebar-link") && event.target.dataset.genreId) {
      const genreId = event.target.dataset.genreId;
      const genreName = event.target.dataset.genreName;
      localStorage.setItem("urlParam", `with_genres=${genreId}`);
      localStorage.setItem("genreName", genreName);
      highlightSelectedGenre();
    }
  });

  // Apply Highlight When Page Loads
  window.addEventListener("load", highlightSelectedGenre);
}
