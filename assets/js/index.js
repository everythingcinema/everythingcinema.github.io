"use strict";

import { sidebar } from "./sidebar.js";
import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { createMovieCard } from "./movie-card.js";
import { createTvShowCard } from "./tv-show-card.js";
import { search } from "./search.js";

const pageContent = document.querySelector("[page-content]");

sidebar();

// Home page sections (Movies & TV Shows)
const homePageSections = [
  { title: "Upcoming Movies", path: "/movie/upcoming" },
  { title: "Weekly Trending Movies", path: "/trending/movie/week" },
  { title: "Top Rated Movies", path: "/movie/top_rated" },
  { title: "Popular TV Shows", path: "/tv/popular" },
  { title: "Top Rated TV Shows", path: "/tv/top_rated" },
];

// Fetch all genres then format them
const genreList = {
  asString(genreIdList) {
    let newGenreList = [];
    for (const genreId of genreIdList) {
      this[genreId] && newGenreList.push(this[genreId]); // this == genreList
    }
    return newGenreList.join(", ");
  },
};

// Fetch movie and TV show genres
fetchDataFromServer(
  `https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`,
  function ({ genres }) {
    for (const { id, name } of genres) {
      genreList[id] = name;
    }

    fetchDataFromServer(
      `https://api.themoviedb.org/3/genre/tv/list?api_key=${api_key}`,
      function ({ genres }) {
        for (const { id, name } of genres) {
          genreList[id] = name;
        }

        fetchDataFromServer(
          `https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&page=1`,
          heroBanner
        );
      }
    );
  }
);

// HERO BANNER
const heroBanner = function ({ results: movieList }) {
  const banner = document.createElement("section");
  banner.classList.add("banner");
  banner.ariaLabel = "Popular Movies";

  banner.innerHTML = `
      <div class="banner-slider"></div>
      <div class="slider-control">
        <div class="control-inner"></div>
      </div>
    `;

  let controlItemIndex = 0;

  for (const [index, movie] of movieList.entries()) {
    const { backdrop_path, title, release_date, genre_ids, overview, poster_path, vote_average, id } = movie;

    const sliderItem = document.createElement("div");
    sliderItem.classList.add("slider-item");
    sliderItem.setAttribute("slider-item", "");

    sliderItem.innerHTML = `
        <img src="${imageBaseURL}w1280${backdrop_path}" alt="${title}" class="img-cover" loading=${
      index === 0 ? "eager" : "lazy"
    }>
        <div class="banner-content">
          <h2 class="heading">${title}</h2>
          <div class="meta-list">
            <div class="meta-item">${release_date?.split("-")[0] ?? "Not Released"}</div>
            <div class="meta-item card-badge">${vote_average.toFixed(1)}</div>
          </div>
          <p class="genre">${genreList.asString(genre_ids)}</p>
          <p class="banner-text">${overview}</p>
          <a href="./movie-detail.html" class="btn" onclick="getMovieDetail(${id})">
            <img src="./assets/images/play_circle.png" width="24" height="24" aria-hidden="true" alt="play circle">
            <span class="span">Watch Now</span>
          </a>
        </div>
      `;
    banner.querySelector(".banner-slider").appendChild(sliderItem);

    const controlItem = document.createElement("button");
    controlItem.classList.add("poster-box", "slider-item");
    controlItem.setAttribute("slider-control", `${controlItemIndex}`);
    controlItemIndex++;

    controlItem.innerHTML = `
        <img src="${imageBaseURL}w154${poster_path}" alt="Slide to ${title}" loading="lazy" draggable="false" class="img-cover">
      `;
    banner.querySelector(".control-inner").appendChild(controlItem);
  }

  pageContent.appendChild(banner);
  addHeroSlide();

  for (const { title, path } of homePageSections) {
    fetchDataFromServer(
      `https://api.themoviedb.org/3${path}?api_key=${api_key}&page=1`,
      createContentList,
      title
    );
  }
};

// HERO SLIDER
const addHeroSlide = function () {
  const sliderItems = document.querySelectorAll("[slider-item]");
  const sliderControls = document.querySelectorAll("[slider-control]");

  let lastSliderItem = sliderItems[0];
  let lastSliderControl = sliderControls[0];

  lastSliderItem.classList.add("active");
  lastSliderControl.classList.add("active");

  const sliderStart = function () {
    lastSliderItem.classList.remove("active");
    lastSliderControl.classList.remove("active");

    sliderItems[Number(this.getAttribute("slider-control"))].classList.add("active");
    this.classList.add("active");

    lastSliderItem = sliderItems[Number(this.getAttribute("slider-control"))];
    lastSliderControl = this;
  };

  sliderControls.forEach(control => control.addEventListener("click", sliderStart));
};

// Create a list for both Movies and TV Shows
const createContentList = function ({ results: contentList }, title) {
  const contentListElem = document.createElement("section");
  contentListElem.classList.add("movie-list");
  contentListElem.ariaLabel = `${title}`;

  contentListElem.innerHTML = `
    <div class="title-wrapper">
      <h3 class="title-large">${title}</h3>
    </div>
    <div class="slider-list">
      <div class="slider-inner"></div>
    </div>
  `;

  for (const content of contentList) {
    const contentCard = content.name ? createTvShowCard(content) : createMovieCard(content);
    contentListElem.querySelector(".slider-inner").appendChild(contentCard);
  }

  pageContent.appendChild(contentListElem);
};

// **Make Sure the Search Function is Active**
search();
