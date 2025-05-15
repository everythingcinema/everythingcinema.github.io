"use strict";

import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createMovieCard } from "./movie-card.js";
import { search } from "./search.js";

const movieId = window.localStorage.getItem("movieId");
const pageContent = document.querySelector("[page-content]");

sidebar();

const getGenres = function (genreList) {
  return genreList.map(({ name }) => name).join(", ");
};

const getCasts = function (castList) {
  return castList.slice(0, 10).map(({ name }) => name).join(", ");
};

const getDirectors = function (crewList) {
  return crewList.filter(({ job }) => job === "Director").map(({ name }) => name).join(", ");
};

const filterVideos = function (videoList) {
  return videoList.filter(
    ({ type, site }) =>
      (type === "Trailer" || type === "Teaser") && site === "YouTube"
  );
};

const switchEmbed = function (url) {
  const iframe = document.getElementById("movieIframe");
  if (iframe) {
    iframe.src = url;
  }
};

const getImdbIdAndEmbed = function (urlPrefix) {
  const extidsUrl = `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${api_key}`;

  fetch(extidsUrl)
    .then((response) => response.json())
    .then((data) => {
      const imdbId = data.imdb_id;
      if (imdbId) {
        const embedUrl = `${urlPrefix}${imdbId}`;
        switchEmbed(embedUrl);
      } else {
        console.warn("IMDb ID not found for this movie.");
      }
    })
    .catch((error) => console.error("Error fetching IMDb ID:", error));
};

fetchDataFromServer(
  `https://api.themoviedb.org/3/movie/${movieId}?api_key=${api_key}&append_to_response=casts,videos,images,releases`,
  function (movie) {
    const {
      backdrop_path,
      poster_path,
      title,
      release_date,
      runtime,
      vote_average,
      releases: {
        countries: [{ certification } = { certification: "N/A" }],
      },
      genres,
      overview,
      casts: { cast, crew },
      videos: { results: videos },
    } = movie;

    document.title = `${title} - Everything Cinema`;

    const movieDetail = document.createElement("div");
    movieDetail.classList.add("movie-detail");

    movieDetail.innerHTML = `
      <!-- Movie Player ABOVE the backdrop -->
      <div class="player-wrapper">
        <iframe id="movieIframe" width="100%" height="480" frameborder="0" allowfullscreen></iframe>
      </div>

      <div class="backdrop-image" style="background-image: url('${imageBaseURL}${"w1280" || "original"}${backdrop_path || poster_path}')"></div>

      <figure class="poster-box movie-poster">
        <img src="${imageBaseURL}w342${poster_path}" alt="${title} poster" class="img-cover">
      </figure>

      <div class="detail-box">
        <div class="detail-content">
          <h1 class="heading">${title}</h1>

          <div class="meta-list">
            <div class="meta-item">
              <img src="./assets/images/star.png" width="20" height="20" alt="rating">
              <span class="span">${vote_average.toFixed(1)}</span>
            </div>

            <div class="separator"></div>
            <div class="meta-item">${runtime}m</div>
            <div class="separator"></div>
            <div class="meta-item">${release_date?.split("-")[0] ?? "Not Released"}</div>
            <div class="meta-item card-badge">${certification}</div>
          </div>

          <p class="genre">${getGenres(genres)}</p>
          <p class="overview">${overview}</p>

          <ul class="detail-list">
            <div class="list-item">
              <p class="list-name">Starring</p>
              <p>${getCasts(cast)}</p>
            </div>

            <div class="list-item">
              <p class="list-name">Directed By</p>
              <p>${getDirectors(crew)}</p>
            </div>
          </ul>
        </div>

        <div class="title-wrapper">
          <h3 class="title-large">Trailers and Clips</h3>
        </div>

        <div class="slider-list">
          <div class="slider-inner"></div>
        </div>
      </div>
    `;

    // Set default player
    switchEmbed(`https://embed.smashystream.com/playere.php?tmdb=${movieId}`);

    // Add YouTube trailers
    for (const { key, name } of filterVideos(videos)) {
      const videoCard = document.createElement("div");
      videoCard.classList.add("video-card");

      videoCard.innerHTML = `
        <iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?&theme=dark&color=white&rel=0"
          frameborder="0" allowfullscreen="1" title="${name}" class="img-cover" loading="lazy"></iframe>
      `;

      movieDetail.querySelector(".slider-inner").appendChild(videoCard);
    }

    pageContent.appendChild(movieDetail);

    // Setup server switching buttons
    setupButtons();

    // Add recommended movies
    fetchDataFromServer(
      `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${api_key}&page=1`,
      addSuggestedMovies
    );
  }
);

const addSuggestedMovies = function ({ results: movieList }) {
  const movieListElem = document.createElement("section");
  movieListElem.classList.add("movie-list");
  movieListElem.ariaLabel = "You May Also Like";

  movieListElem.innerHTML = `
    <div class="title-wrapper">
      <h3 class="title-large">You May Also Like</h3>
    </div>

    <div class="slider-list">
      <div class="slider-inner"></div>
    </div>
  `;

  for (const movie of movieList) {
    const movieCard = createMovieCard(movie);
    movieListElem.querySelector(".slider-inner").appendChild(movieCard);
  }

  pageContent.appendChild(movieListElem);
};

const setupButtons = function () {
  const buttons = document.querySelectorAll("#buttons .btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const serverType = button.getAttribute("data-server-type");

      switch (serverType) {
        case "SS":
          switchEmbed(`https://embed.smashystream.com/playere.php?tmdb=${movieId}`);
          break;
        case "SE":
          switchEmbed(`https://multiembed.mov/directstream.php?video_id=${movieId}&tmdb=1`);
          break;
        case "VS":
          switchEmbed(`https://vidsrc.xyz/embed/${movieId}`);
          break;
        case "DS":
          getImdbIdAndEmbed("https://gomo.to/movie/");
          break;
        case "VST":
          getImdbIdAndEmbed("https://vidsrc.to/embed/movie/");
          break;
        case "BV":
          switchEmbed(`https://blackvid.space/embed?tmdb=${movieId}`);
          break;
        default:
          console.warn("Unknown server type:", serverType);
      }
    });
  });
};

search();
