// Updated tv-show-detail.js with trailer section, adjusted player controls, and new Server 4
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
        number_of_seasons,
        videos: { results: videos } = { results: [] },
        credits: { cast, crew } = { cast: [], crew: [] },
        recommendations: { results: relatedShows } = { results: [] },
      } = show;

      const directors =
        crew.filter((person) => person.job === "Director").map((person) => person.name).join(", ") || "Unknown";
      const topCast = cast.slice(0, 5).map((actor) => actor.name).join(", ") || "Unknown";

      document.title = `${name} - Everything Cinema`;

      const playerContainer = document.createElement("section");
      playerContainer.className = "player-section";

      playerContainer.innerHTML = `
        <div class="tv-backdrop-section" style="background-image: url('${imageBaseURL}w1280${backdrop_path || poster_path}')">
          <div class="tv-backdrop-overlay">
            <iframe
              id="seriesIframe"
              src=""
              style="margin-bottom: 10px; box-shadow: 0px 5px 20px rgba(255, 255, 255, 0.73);"
              width="100%"
              height="500"
              frameborder="0"
              allowfullscreen
              loading="lazy"
              class="tv-iframe"
            ></iframe>
            <div class="player-controls">
              <button id="Server1Btn" class="btn">Server 1</button>
              <button id="Server2Btn" class="btn">Server 2</button>
              <button id="Server3Btn" class="btn">Server 3</button>
              <button id="Server4Btn" class="btn">Server 4</button>
            </div>

            <div class="selectors-wrapper">
              <label for="Sno">Season:</label>
              <select id="Sno"></select>
              <label for="epNo">Episode:</label>
              <select id="epNo"></select>
            </div>

            <div class="markdown-div" style="padding-top: 2%;">
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
          </div>
        </div>
      `;

      pageContent.innerHTML = "";
      pageContent.appendChild(playerContainer);

      const tvShowDetail = document.createElement("div");
      tvShowDetail.classList.add("movie-detail");

      tvShowDetail.innerHTML = `
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

            <div class="title-wrapper">
              <h3 class="title-large">Trailers and Clips</h3>
            </div>

            <div class="slider-list">
              <div class="slider-inner">
                ${videos.filter(v => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube")
                  .map(v => `
                    <div class="video-card">
                      <iframe width="500" height="294" src="https://www.youtube.com/embed/${v.key}?&theme=dark&color=white&rel=0"
                        frameborder="0" allowfullscreen title="${v.name}" class="img-cover" loading="lazy"></iframe>
                    </div>
                  `).join("")}
              </div>
            </div>
          </div>
        </div>
      `;

      pageContent.appendChild(tvShowDetail);

      setupPlayer(tvShowId);

      fetchDataFromServer(
        `https://api.themoviedb.org/3/tv/popular?api_key=${api_key}&page=1`,
        displayPopularTvShows
      );

      displayRelatedTvShows(relatedShows);
    }
  );
}

function setupPlayer(tvShowId) {
  const apiKey = api_key;
  const seasonSelect = document.getElementById("Sno");
  const episodeSelect = document.getElementById("epNo");
  const iframe = document.getElementById("seriesIframe");
  const server1Btn = document.getElementById("Server1Btn");
  const server2Btn = document.getElementById("Server2Btn");
  const server3Btn = document.getElementById("Server3Btn");
  const server4Btn = document.getElementById("Server4Btn");

  fetch(`https://api.themoviedb.org/3/tv/${tvShowId}?api_key=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      data.seasons.filter((season) => season.season_number !== 0).forEach((season) => {
        const option = document.createElement("option");
        option.value = season.season_number;
        option.textContent = `Season ${season.season_number}`;
        seasonSelect.appendChild(option);
      });
      seasonSelect.value = data.seasons.find((s) => s.season_number !== 0)?.season_number || 1;
      seasonSelect.dispatchEvent(new Event("change"));
    })
    .catch((err) => console.error("Error fetching seasons:", err));

  seasonSelect.addEventListener("change", () => {
    const seasonNumber = seasonSelect.value;
    episodeSelect.innerHTML = "";

    fetch(`https://api.themoviedb.org/3/tv/${tvShowId}/season/${seasonNumber}?api_key=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        data.episodes.forEach((episode) => {
          const option = document.createElement("option");
          option.value = episode.episode_number;
          option.textContent = `Episode ${episode.episode_number}`;
          episodeSelect.appendChild(option);
        });
        episodeSelect.value = data.episodes[0]?.episode_number || 1;
        episodeSelect.dispatchEvent(new Event("change"));
      })
      .catch((err) => console.error("Error fetching episodes:", err));
  });

  function buildEmbedUrls(season, episode) {
    return {
      server1: `https://embed.smashystream.com/playere.php?tmdb=${tvShowId}&season=${season}&episode=${episode}`,
      server2: `https://multiembed.mov/directstream.php?video_id=${tvShowId}&tmdb=1&s=${season}&e=${episode}`,
      server3: `https://vidsrc.xyz/embed/tv?tmdb=${tvShowId}&season=${season}&episode=${episode}`,
      server4: `https://vidfast.pro/tv/${tvShowId}/${season}/${episode}?autoPlay=true`,
    };
  }

  function switchEmbed(url) {
    iframe.src = url;
  }

  episodeSelect.addEventListener("change", () => {
    const season = seasonSelect.value;
    const episode = episodeSelect.value;
    const embeds = buildEmbedUrls(season, episode);
    switchEmbed(embeds.server4);// TO SWITCH DEFAULT SERVER CHANGE THE SERVER NUMBER IN THIS LINE//
    server1Btn.onclick = () => switchEmbed(embeds.server1);
    server2Btn.onclick = () => switchEmbed(embeds.server2);
    server3Btn.onclick = () => switchEmbed(embeds.server3);
    server4Btn.onclick = () => switchEmbed(embeds.server4);
  });

  [server1Btn, server2Btn, server3Btn, server4Btn].forEach((btn) => (btn.disabled = true));

  episodeSelect.addEventListener("change", () => {
    [server1Btn, server2Btn, server3Btn, server4Btn].forEach((btn) => (btn.disabled = false));
  });
}

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
