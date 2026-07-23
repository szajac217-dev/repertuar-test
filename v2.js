const DATA_FILE = "data/2026-07.json";

const title = document.getElementById("title");
const nav = document.getElementById("date-nav");
const scroller = document.getElementById("movies-scroll");

fetch(DATA_FILE)
  .then(response => {
    if (!response.ok) throw new Error("Nie udało się pobrać repertuaru.");
    return response.json();
  })
  .then(data => {
    title.textContent = `Repertuar — ${data.month}`;
    renderMovies