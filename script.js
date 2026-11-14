const header = document.querySelector(".header");
const toggle = document.querySelector(".nav-toggle");
const navigation = document.querySelector("#navegacao");
const mobile = window.matchMedia("(max-width: 760px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setMenu(open) {
  navigation.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
}

function syncNavigation() {
  toggle.hidden = !mobile.matches;
  setMenu(false);
}

header.classList.add("enhanced");
syncNavigation();
mobile.addEventListener("change", syncNavigation);
toggle.addEventListener("click", () =>
  setMenu(toggle.getAttribute("aria-expanded") !== "true"),
);
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
header.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    setMenu(false);
    toggle.focus();
  }
});

const tour = document.querySelector(".tour");
if (tour) {
  const slides = Array.from(tour.querySelectorAll(".tour-slide"));
  const controls = tour.querySelector(".tour-controls");
  const choices = Array.from(controls.querySelectorAll("button"));
  const play = document.createElement("button");
  play.type = "button";
  play.textContent = "Reproduzir passeio";
  controls.append(play);

  let current = 0;
  let timer = null;

  function selectSlide(index) {
    current = index;
    slides.forEach((slide, position) =>
      slide.classList.toggle("current", position === index),
    );
    choices.forEach((choice, position) =>
      choice.setAttribute("aria-pressed", String(position === index)),
    );
  }

  function pauseTour() {
    window.clearInterval(timer);
    timer = null;
    tour.classList.remove("playing");
    play.textContent = "Reproduzir passeio";
  }

  function syncMotion() {
    if (reducedMotion.matches) pauseTour();
    play.hidden = reducedMotion.matches;
  }

  tour.classList.add("enhanced");
  controls.hidden = false;
  choices.forEach((choice, index) =>
    choice.addEventListener("click", () => {
      pauseTour();
      selectSlide(index);
    }),
  );
  play.addEventListener("click", () => {
    if (timer !== null) {
      pauseTour();
      return;
    }
    tour.classList.add("playing");
    play.textContent = "Pausar passeio";
    timer = window.setInterval(
      () => selectSlide((current + 1) % slides.length),
      6000,
    );
  });
  syncMotion();
  reducedMotion.addEventListener("change", syncMotion);
}

const filters = document.querySelector(".filters");
if (filters) {
  const buttons = Array.from(filters.querySelectorAll("button"));
  const categories = document.querySelectorAll("[data-category]");
  filters.hidden = false;
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((choice) =>
        choice.setAttribute("aria-pressed", String(choice === button)),
      );
      categories.forEach((category) => {
        category.hidden =
          filter !== "todos" && category.dataset.category !== filter;
      });
    }),
  );
}

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.remove("reveal-pending");
        observer.unobserve(target);
      });
    },
    { threshold: 0.06 },
  );
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    element.classList.add("reveal-pending");
    observer.observe(element);
  });
}

const catalog = document.querySelector(".menu-catalog");
if (catalog) {
  const categories = Array.from(
    catalog.querySelectorAll("[data-menu-category]"),
  );
  const filters = catalog.querySelectorAll("[data-menu-filter]");
  const choices = Array.from(catalog.querySelectorAll(".dish-choice"));
  const stage = catalog.querySelector(".dish-stage");
  const image = stage.querySelector("img");
  const visual = stage.querySelector(".dish-visual");
  const detail = stage.querySelector(".dish-detail");
  const copy = stage.querySelector(".dish-copy");
  let visible = choices;
  let current = choices[0];
  let transitions = [];

  function selectDish(button, animate) {
    current = button;
    choices.forEach((choice) =>
      choice.setAttribute("aria-pressed", String(choice === current)),
    );
    const name = button.querySelector("span").firstChild.textContent.trim();
    const photo = button.dataset.image;
    visual.hidden = !photo;
    detail.classList.toggle("no-photo", !photo);
    if (photo) image.src = photo;
    image.alt = name;
    stage.querySelector("#dish-name").textContent = name;
    stage.querySelector(".dish-price").textContent =
      button.querySelector("strong").textContent;
    stage.querySelector(".dish-description").textContent =
      button.dataset.description ||
      "Consulte os ingredientes deste item com o Mareyki.";
    stage.querySelector(".dish-count").textContent =
      visible.indexOf(button) + 1 + " / " + visible.length;
    transitions.forEach((animation) => animation.cancel());
    if (animate && !reducedMotion.matches) {
      transitions = [
        image.animate(
          [
            { opacity: 0, transform: "rotate(-52deg) scale(.68)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 720, easing: "cubic-bezier(.2,.75,.2,1)" },
        ),
        ...Array.from(copy.children, (part, index) =>
          part.animate(
            [
              { opacity: 0, transform: "translateY(12px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 360, delay: 160 + index * 65, fill: "backwards" },
          ),
        ),
      ];
    }
  }

  filters.forEach((button) =>
    button.addEventListener("click", () => {
      const filter = button.dataset.menuFilter;
      filters.forEach((choice) =>
        choice.setAttribute("aria-pressed", String(choice === button)),
      );
      categories.forEach((category) => {
        category.hidden =
          filter !== "Tudo" && filter !== category.dataset.menuCategory;
      });
      visible = choices.filter((choice) => !choice.closest("section").hidden);
      selectDish(visible.includes(current) ? current : visible[0], false);
    }),
  );
  choices.forEach((button) =>
    button.addEventListener("click", () => {
      selectDish(button, true);
      stage.showModal();
    }),
  );
  stage.querySelectorAll("[data-step]").forEach((button) =>
    button.addEventListener("click", () => {
      const next =
        (visible.indexOf(current) +
          Number(button.dataset.step) +
          visible.length) %
        visible.length;
      selectDish(visible[next], true);
    }),
  );
  stage.addEventListener("click", (event) => {
    if (event.target === stage) stage.close();
  });
  selectDish(current, false);
}
