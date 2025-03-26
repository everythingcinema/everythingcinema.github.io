"use strict";

import { api_key, fetchDataFromServer } from "./api.js";
import { createMovieCard } from "./movie-card.js";
import { createTvShowCard } from "./tv-show-card.js";

export function search() {
  const searchWrapper = document.querySelector("[search-wrapper]");
  const searchField = document.querySelector("[search-field]");

  const searchResultModal = document.createElement("div");
  searchResultModal.classList.add("search-modal");
  document.querySelector("main").appendChild(searchResultModal);

  let searchTimeout;

  searchField.addEventListener("input", function () {
    if (!searchField.value.trim()) {
      searchResultModal.classList.remove("active");
      searchWrapper.classList.remove("searching");
      clearTimeout(searchTimeout);
      return;
    }

    searchWrapper.classList.add("searching");
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${searchField.value}&page=1&include_adult=false`;
      const tvShowUrl = `https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${searchField.value}&page=1&include_adult=false`;

      Promise.all([
        fetch(movieUrl).then(res => res.json()),
        fetch(tvShowUrl).then(res => res.json())
      ]).then(([movieData, tvShowData]) => {
        searchWrapper.classList.remove("searching");
        searchResultModal.classList.add("active");
        searchResultModal.innerHTML = ""; // Clear old results

        searchResultModal.innerHTML = `
          <p class="label">Results for</p>
          <h1 class="heading">${searchField.value}</h1>
          <div class="movie-list">
            <div class="grid-list"></div>
          </div>
        `;

        for (const movie of movieData.results) {
          const movieCard = createMovieCard(movie);
          searchResultModal.querySelector(".grid-list").appendChild(movieCard);
        }

        for (const show of tvShowData.results) {
          const tvShowCard = createTvShowCard(show);
          searchResultModal.querySelector(".grid-list").appendChild(tvShowCard);
        }
      }).catch(error => console.error("Error fetching search results:", error));
    }, 500);
  });
}
