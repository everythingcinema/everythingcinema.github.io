"use strict";

import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createMovieCard } from "./movie-card.js";
import { search } from "./search.js";

const movieId = window.localStorage.getItem("movieId");
const pageContent = document.querySelector("[page-content]");

sidebar();

if (!movieId) {
  pageContent.innerHTML = `<h2 class="no-results">Movie not found. Please select a movie again.</h2>`;
} else {
  fetchDataFromServer(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${api_key}&append_to_response=casts,videos,images,releases`,
    (movie) => {
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

      const playerContainer = document.createElement("section");
      playerContainer.className = "player-section";
     // TO SWITCH DEFAULT SERVER CHANGE THE ENDPOINT URL IN THE IFRAME SRC ON LINE 48//

      playerContainer.innerHTML = `
        <div id="videoPlayer" style="background-color: rgba(3, 16, 27, 0); color: black;">
          <center>
            <iframe
              allowfullscreen
              frameborder="0"
              id="movieIframe"
              src="https://vidfast.pro/movie/${movieId}?autoPlay=true" 
              style="margin-bottom: -5px; box-shadow: 0px 5px 20px rgba(255, 255, 255, 0.73);"
              width="100%"
              height="480"
              class="shimmer-bg"
              loading="lazy"
            ></iframe>
          </center>
        </div>

        <div id="buttons" style="text-align: center; margin: 20px 0;">
          <button class="btn" data-server-type="SS">Server SS</button>
          <button class="btn" data-server-type="SE">Server SE</button>
          <button class="btn" data-server-type="VS">Server VS</button>
          <button class="btn" data-server-type="DS">Server DS</button>
          <button class="btn" data-server-type="VST">Server VST</button>
          <button class="btn" data-server-type="VFST">SERVER VFST</button>
        </div>

        <center>
          <div class="markdown-div" style="padding-top: 5%;">
            <pre style="background-color:#1f121200"><code>
<h1>INSTRUCTIONS</h1>
- Use an Adblocker for better experience.
- Server VS is the default server. If it fails, try others.
- Repress the server if it doesn't play after waiting.
- Don't press buttons continuously.
- If redirected, close the tab and come back.
- Enjoy✨😇
            </code></pre>
          </div>
        </center>
      `;

      pageContent.innerHTML = "";
      pageContent.appendChild(playerContainer);

      const movieDetail = document.createElement("div");
      movieDetail.classList.add("movie-detail");

      movieDetail.innerHTML = `
        <div class="backdrop-image" style="background-image: url('${imageBaseURL}w1280${backdrop_path || poster_path}')"></div>

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

            <p class="genre">${genres.map((g) => g.name).join(", ")}</p>
            <p class="overview">${overview}</p>

            <ul class="detail-list">
              <div class="list-item">
                <p class="list-name">Starring</p>
                <p>${cast.slice(0, 10).map(c => c.name).join(", ")}</p>
              </div>

              <div class="list-item">
                <p class="list-name">Directed By</p>
                <p>${crew.filter(c => c.job === "Director").map(c => c.name).join(", ")}</p>
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

      for (const { key, name } of videos.filter(v => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube")) {
        const videoCard = document.createElement("div");
        videoCard.classList.add("video-card");
        videoCard.innerHTML = `
          <iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?&theme=dark&color=white&rel=0"
            frameborder="0" allowfullscreen title="${name}" class="img-cover" loading="lazy"></iframe>
        `;
        movieDetail.querySelector(".slider-inner").appendChild(videoCard);
      }

      pageContent.appendChild(movieDetail);

      setupButtons();

      fetchDataFromServer(
        `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${api_key}&page=1`,
        addSuggestedMovies
      );
    }
  );
}

const setupButtons = () => {
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
        case "VFST":
          switchEmbed(`https://vidfast.pro/movie/${movieId}?autoPlay=true`);
          break;
        default:
          console.warn("Unknown server type:", serverType);
      }
    });
  });
};

const switchEmbed = (url) => {
  const iframe = document.getElementById("movieIframe");
  if (iframe) iframe.src = url;
};

const getImdbIdAndEmbed = (urlPrefix) => {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${api_key}`)
    .then((res) => res.json())
    .then((data) => {
      const imdbId = data.imdb_id;
      if (imdbId) {
        const embedUrl = `${urlPrefix}${imdbId}`;
        switchEmbed(embedUrl);
      } else {
        console.warn("IMDb ID not found.");
      }
    })
    .catch((err) => console.error("Error fetching IMDb ID:", err));
};

const addSuggestedMovies = ({ results: movieList }) => {
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

search();
