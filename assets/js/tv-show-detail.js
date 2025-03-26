"use strict";

import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { search } from "./search.js";
import { createTvShowCard } from "./tv-show-card.js";

const tvShowId = window.localStorage.getItem("tvShowId");
const pageContent = document.querySelector("[page-content]");

sidebar();

if (!tvShowId) {
  pageContent.innerHTML = `<h2 class="no-results">TV show not found. Please select a show again.</h2>`;
} else {
  fetchDataFromServer(
    `https://api.themoviedb.org/3/tv/${tvShowId}?api_key=${api_key}&append_to_response=videos,credits,recommendations`,
    function (show) {
      if (!show || !show.name) {
        pageContent.innerHTML = `<h2 class="no-results">TV show details not available.</h2>`;
        return;
      }

      const {
        backdrop_path,
        poster_path,
        name,
        first_air_date,
        vote_average,
        genres,
        overview,
        number_of_seasons, // Fetch number of seasons
        videos: { results: videos } = { results: [] },
        credits: { cast, crew } = { cast: [], crew: [] },
        recommendations: { results: relatedShows } = { results: [] },
      } = show;

      const directors = crew.filter(person => person.job === "Director").map(person => person.name).join(", ") || "Unknown";
      const topCast = cast.slice(0, 5).map(actor => actor.name).join(", ") || "Unknown";

      document.title = `${name} - Everything Cinema`;

      const tvShowDetail = document.createElement("div");
      tvShowDetail.classList.add("movie-detail");

      tvShowDetail.innerHTML = `
      <div class="backdrop-image" style="background-image: url('${imageBaseURL}${
        backdrop_path || poster_path ? "w1280" + (backdrop_path || poster_path) : ""
      }')"></div>
      
      <figure class="poster-box movie-poster">
        <img src="${imageBaseURL}w342${poster_path}" alt="${name} poster" class="img-cover">
      </figure>
      
      <div class="detail-box">
        <div class="detail-content">
          <h1 class="heading">${name}</h1>
      
          <div class="meta-list">
            <div class="meta-item">
              <img src="./assets/images/star.png" width="20" height="20" alt="rating">
              <span class="span">${vote_average.toFixed(1)}</span>
            </div>
            <div class="separator"></div>
            <div class="meta-item">${first_air_date?.split("-")[0] ?? "N/A"}</div>
            <div class="separator"></div>
            <div class="meta-item"><b>${number_of_seasons} Season(s)</b></div>
          </div>
      
          <p class="genre">${genres.map((g) => g.name).join(", ")}</p>
          <p class="overview">${overview}</p>

          <ul class="detail-list">
            <div class="list-item">
              <p class="list-name">Starring</p>
              <p>${topCast}</p>
            </div>

            <div class="list-item">
              <p class="list-name">Directed By</p>
              <p>${directors}</p>
            </div>
          </ul>

          <div class="banner">
            <a href="#" class="btn" onclick="og_load();">
              <img src="./assets/images/play_circle.png" width="24" height="24" aria-hidden="true" alt="play circle">
              <span class="span">Watch Now</span>
            </a>
          </div>

        </div>

        <div class="title-wrapper">
          <h3 class="title-large">Trailers and Clips</h3>
        </div>
      
        <div class="slider-list">
          <div class="slider-inner">
            ${
              videos.length > 0
                ? videos
                    .filter(video => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"))
                    .map(
                      ({ key, name }) => `
                <div class="video-card">
                  <iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?&theme=dark&color=white&rel=0"
                    frameborder="0" allowfullscreen="1" title="${name}" class="img-cover" loading="lazy" onerror="this.parentElement.style.display='none';"></iframe>
                </div>
              `
                    )
                    .join("") || "<p>No available trailers.</p>"
                : "<p>No trailers available.</p>"
            }
          </div>
        </div>
      </div>
    `;

      pageContent.appendChild(tvShowDetail);

      fetchDataFromServer(
        `https://api.themoviedb.org/3/tv/popular?api_key=${api_key}&page=1`,
        displayPopularTvShows
      );

      displayRelatedTvShows(relatedShows);
    }
  );
}

// Display Popular TV Shows
const displayPopularTvShows = function ({ results: popularShows }) {
  if (!popularShows || popularShows.length === 0) return;

  const popularShowsElem = document.createElement("section");
  popularShowsElem.classList.add("movie-list");
  popularShowsElem.ariaLabel = "Popular TV Shows";

  popularShowsElem.innerHTML = `
    <div class="title-wrapper">
      <h3 class="title-large">Popular TV Shows</h3>
    </div>
    <div class="slider-list">
      <div class="slider-inner"></div>
    </div>
  `;

  for (const show of popularShows.slice(0, 10)) {
    const tvShowCard = createTvShowCard(show);
    popularShowsElem.querySelector(".slider-inner").appendChild(tvShowCard);
  }

  pageContent.appendChild(popularShowsElem);
};

// Display Related TV Shows
const displayRelatedTvShows = function (relatedShows) {
  if (!relatedShows || relatedShows.length === 0) return;

  const relatedShowsElem = document.createElement("section");
  relatedShowsElem.classList.add("movie-list");
  relatedShowsElem.ariaLabel = "Related TV Shows";

  relatedShowsElem.innerHTML = `
    <div class="title-wrapper">
      <h3 class="title-large">You May Also Like</h3>
    </div>
    <div class="slider-list">
      <div class="slider-inner"></div>
    </div>
  `;

  for (const show of relatedShows.slice(0, 10)) {
    const tvShowCard = createTvShowCard(show);
    relatedShowsElem.querySelector(".slider-inner").appendChild(tvShowCard);
  }

  pageContent.appendChild(relatedShowsElem);
};

search();
