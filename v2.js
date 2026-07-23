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
    renderMovies(data.movies || []);
  })
  .catch(error => {
    scroller.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  });

function renderMovies(movies) {
  scroller.innerHTML = "";
  nav.innerHTML = "";

  const groups = movies.reduce((result, movie) => {
    (result[movie.date] ||= []).push(movie);
    return result;
  }, {});

  Object.entries(groups).forEach(([date, dayMovies], index) => {
    const section = document.createElement("section");
    section.className = "day";
    section.id = `date-${date.replaceAll(".", "-")}`;
    section.innerHTML = `
      <h2 class="day-title">
        <span class="date-pill">${escapeHtml(date)}</span>
        <span class="day-name">${escapeHtml(dayName(date))}</span>
      </h2>
      <div class="cards"></div>`;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = shortDate(date);
    button.dataset.target = section.id;
    if (index === 0) button.classList.add("active");
    button.addEventListener("click", () => {
      nav.querySelectorAll("button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    nav.appendChild(button);

    const cards = section.querySelector(".cards");
    dayMovies.forEach(movie => cards.appendChild(createCard(movie)));
    scroller.appendChild(section);
  });
}

function createCard(movie) {
  const card = document.createElement("article");
  card.className = `card${movie.dkf ? " dkf" : ""}`;

  const ageBadge = movie.age && movie.age !== "—"
    ? `<span class="badge age ${ageClass(movie.age)}">Wiek: ${formatAge(movie.age)}</span>`
    : "";

  const meta = [
    movie.genre,
    movie.country && movie.country !== "—" ? movie.country : "",
    movie.duration !== "—" && movie.duration != null ? `${movie.duration} min` : ""
  ].filter(Boolean).map(escapeHtml).join(" · ");

  card.innerHTML = `
    <div class="poster">
      <img src="posters/${encodeURIComponent(movie.poster)}" alt="${escapeHtml(movie.title)}" onerror="showMissingPoster(this)">
    </div>
    <div class="content">
      <div class="badges">
        <span class="badge time">godz. ${escapeHtml(movie.time)}</span>
        ${movie.dkf ? '<span class="badge dkf-badge">DKF</span>' : ""}
        ${movie.ticket ? `<span class="badge ticket">Bilet: ${escapeHtml(movie.ticket)}</span>` : ""}
        ${ageBadge}
      </div>
      <h3>${escapeHtml(movie.title)}</h3>
      <div class="meta">${meta}</div>
      <div class="info">
        ${movie.year !== "—" ? `<p><strong>Rok produkcji:</strong> ${escapeHtml(movie.year)}</p>` : ""}
        ${movie.type ? `<p><strong>Rodzaj:</strong> ${escapeHtml(movie.type)}</p>` : ""}
        ${movie.director && movie.director !== "—" ? `<p><strong>Reżyseria:</strong> ${escapeHtml(movie.director)}</p>` : ""}
        ${movie.cast ? `<p><strong>Obsada:</strong> ${escapeHtml(movie.cast)}</p>` : ""}
        ${movie.distributor ? `<p><strong>Dystrybutor:</strong> ${escapeHtml(movie.distributor)}</p>` : ""}
      </div>
    </div>`;

  return card;
}

function shortDate(dateStr) {
  const [day, month] = dateStr.split(".");
  const months = ["", "sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
  return `${Number(day)} ${months[Number(month)]}`;
}

function dayName(dateStr) {
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatAge(age) {
  const value = String(age);
  return value.includes("+") ? value : `${value}+`;
}

function ageClass(age) {
  const value = String(age).replace("+", "");
  if (["7", "8", "9"].includes(value)) return "age-family";
  if (value === "10") return "age-young";
  if (value === "13") return "age-teen";
  if (["15", "16"].includes(value)) return "age-older";
  if (value === "18") return "age-adult";
  return "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMissingPoster(img) {
  img.parentElement.innerHTML = '<div class="poster-missing">Brak plakatu</div>';
}
