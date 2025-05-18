"use strict";

import { imageBaseURL } from "./api.js";

// TV Show card
export function createTvShowCard(show) {
  const { poster_path, name, vote_average, first_air_date, id } = show;

  const card = document.createElement("div");
  card.classList.add("movie-card");

  card.innerHTML = `
    <figure class="poster-box card-banner">
      <img src="${imageBaseURL}w342${poster_path}" alt="${name}" class="img-cover" loading="lazy">
    </figure>
    
    <h4 class="title">${name}</h4>
    
    <div class="meta-list">
      <div class="meta-item">
        <img src="./assets/images/star.png" width="20" height="20" loading="lazy" alt="rating">
        <span class="span">${vote_average.toFixed(1)}</span>
      </div>
      <div class="card-badge">${first_air_date.split("-")[0]}</div>
    </div>
    
    <a href="./tv-show-detail.html" class="card-btn" title="${name}" onclick="setTvShowId(${id})"></a>
  `;

  return card;
}

// Store the TV show ID in localStorage before navigating
window.setTvShowId = function (id) {
  localStorage.setItem("tvShowId", id);
};
