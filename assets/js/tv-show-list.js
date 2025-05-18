"use strict";

import { api_key, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createTvShowCard } from "./tv-show-card.js";
import { search } from "./search.js";

const genreName = window.localStorage.getItem("genreName");
const urlParam = window.localStorage.getItem("urlParam");

const pageContent = document.querySelector("[page-content]");

sidebar();

let currentPage = 1;
let totalPages = 0;

fetchDataFromServer(
  `https://api.themoviedb.org/3/discover/tv?api_key=${api_key}&sort_by=popularity.desc&include_adult=false&page=${currentPage}&${urlParam}`,
  function ({ results: tvShowList, total_pages }) {
    if (!tvShowList || tvShowList.length === 0) {
      pageContent.innerHTML = `<h2 class="no-results">No TV shows found.</h2>`;
      return;
    }

    totalPages = total_pages;

    document.title = `${genreName || "Popular"} TV Shows - Everything Cinema`;

    const tvShowListElem = document.createElement("section");
    tvShowListElem.classList.add("movie-list", "genre-list");
    tvShowListElem.ariaLabel = `${genreName} TV Shows`;

    tvShowListElem.innerHTML = `
    <div class="title-wrapper">
      <h1 class="heading">All ${genreName || "Popular"} TV Shows</h1>
    </div>
    
    <div class="grid-list"></div>
    
    <button class="btn load-more" load-more>Load More</button>
  `;

    for (const show of tvShowList) {
      const tvShowCard = createTvShowCard(show);
      tvShowListElem.querySelector(".grid-list").appendChild(tvShowCard);
    }

    pageContent.appendChild(tvShowListElem);

    document
      .querySelector("[load-more]")
      .addEventListener("click", function () {
        if (currentPage >= totalPages) {
          this.style.display = "none";
          return;
        }

        currentPage++;
        this.classList.add("loading");

        fetchDataFromServer(
          `https://api.themoviedb.org/3/discover/tv?api_key=${api_key}&sort_by=popularity.desc&include_adult=false&page=${currentPage}&${urlParam}`,
          ({ results: newTvShows }) => {
            this.classList.remove("loading");

            for (const show of newTvShows) {
              const tvShowCard = createTvShowCard(show);
              tvShowListElem.querySelector(".grid-list").appendChild(tvShowCard);
            }
          }
        );
      });
  }
);

search();
