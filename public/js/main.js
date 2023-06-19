import Swiper from "/js/vendor/swiper-bundle.min";

const projectPreviewSliderElem = document.querySelector(".projects-slider-container .swiper-wrapper");
const projectPreviewTemplate = document.querySelector(".project-preview-template");
let projects;
const initProjects = async () => {
  projects = await (await fetch("/projects")).json();

  projectPreviewSliderElem.querySelectorAll(":scope > *").forEach(e =>  e.tagName !== "template" && e.remove())

  projects.forEach(e => {
    const clone = projectPreviewTemplate.content.cloneNode(true);

    clone.querySelector("img").src = "/projects/previews/" + e.preview;
    clone.querySelector("img").dataset.id = e.id;

    projectPreviewSliderElem.appendChild(clone);
  })

  projectPreviewTemplate.remove();

  projectsSlider.init();
}

const reviewSliderElem = document.querySelector(".reviews-slider-container .swiper-wrapper");
const reviewTemplate = document.querySelector(".review-template");
let reviews
const initReviews = async () => {
  reviews = await (await fetch("/reviews")).json();

  reviewSliderElem.querySelectorAll(":scope > *").forEach(e =>  e.tagName !== "template" && e.remove())

  reviews.forEach(e => {
    const clone = reviewTemplate.content.cloneNode(true);

    clone.querySelector(".review").dataset.id = e.id;
    clone.querySelector(".review-avatar").src = "/avatars/" + e.avatar;
    clone.querySelector(".review-name").innerText = e.name;
    clone.querySelector(".review-company").innerText = e.company;
    clone.querySelector(".review-content").innerText = e.content;
    e.rtl && clone.querySelector(".review").classList.add("rtl");

    reviewSliderElem.appendChild(clone);
  })

  reviewTemplate.remove();

  reviewsSlider.init();
}

const scrollUpButton = document.querySelector(".scroll-up");
const scrollDownButton = document.querySelector(".scroll-down");
const html = document.querySelector("html");

const sections = document.querySelectorAll("section");
let currentSection = 0;

const changeScrollVisibility = () => {
  if (html.scrollTop < 50) {
    scrollUpButton.classList.add("hidden");
  } else {
    scrollUpButton.classList.remove("hidden");
  }

  if (html.scrollTop + html.clientHeight >= html.scrollHeight - 50) {
    scrollDownButton.classList.add("hidden");
  } else {
    scrollDownButton.classList.remove("hidden");
  }
}

const scrollUp = () => {
  if (currentSection > 0) {
    currentSection--;
  }

  location.hash = sections[currentSection].id;
}

const scrollDown = () => {
  if (currentSection < sections.length - 1) {
    currentSection++;
  }

  location.hash = sections[currentSection].id;
}

const onContactFormSubmit = (e) => {
  e.preventDefault();
  const form = e.currentTarget;

  const formData = new FormData(form);

  fetch("/mail/send", {
    body: formData,
    method: "POST"
  }).then(res => {
    if (res.ok) {
      showModal("Thank you!", "Your message successfully delivered.", "ok");
      form.reset();
    } else if (res.status === 429) {
      showModal("Too many requests!", "", "alert");
    } else if (res.status >= 500 && res.status <= 599) {
      showModal("Internal server error.", "This service is not available now.\nTry again later.", "alert");
    } else {
      showModal("Something bad happened.", "Your mail did not delivered. Check fields and try again.", "alert")
    }

    form.classList.remove("loading");
    form.classList.add("finished");
  })

  form.classList.add("loading");
  form.classList.remove("finished");
}

const modal = document.querySelector(".modal-container");
modal.querySelectorAll(".close-modal").forEach(el => {
    el.addEventListener("click", ev => modal.classList.remove("show"))
    el.addEventListener("click", ev => modal.classList.add("closing"))
});
const showModal = (title, message = "", type = "info") => {
  if (title) {
    modal.querySelector(".icon").dataset.icon = ["ok", "info", "alert"].find(e => e === type) || "info";

    modal.querySelector(".title").innerText = title;
    modal.querySelector(".message").innerText = message;

    modal.classList.remove("closing");
    modal.classList.add("show");
  }
}

const onViewProject = (e) => {
  e.preventDefault();

  let index = projectsSlider?.realIndex || 0;
  let id = document.querySelector(`.projects-slider-container .swiper-slide[data-swiper-slide-index="${index}"] > *`).dataset.id;
  let project = projects.find(e => e.id === id);

  window.open("/projects/files/" + project.file, "_blank");
}

const details = document.querySelector("#projects .project-details");
const title = document.querySelector("#projects .title");
const description = document.querySelector("#projects .description");
const changeProjectDescription = () => {
  let index = projectsSlider?.realIndex || 0;
  let id = document.querySelector(`.projects-slider-container .swiper-slide[data-swiper-slide-index="${index}"] > *`).dataset.id;
  let project = projects.find(e => e.id === id);

  details.addEventListener("animationend", () => {
    title.innerHTML = project.title;
    description.innerHTML = project.description;
    details.classList.remove("hide")
  }, {once: true});
  details.classList.add("hide");
}

const projectsSlider = new Swiper('.projects-slider-container', {
  init: false,
  direction: 'horizontal',
  loop: true,
  slidesPerView: 1,
  centeredSlides: true,
  spaceBetween: 0,
  speed: 300,
  autoplay: {
    delay: 3500,
    pauseOnMouseEnter: true
  },
  allowTouchMove: false,
  breakpoints: {
    864: {
      slidesPerView: 3
    }
  },
  on: {
    slideChange: changeProjectDescription
  },

  navigation: {
    nextEl: '.projects-button-next',
    prevEl: '.projects-button-prev',
  }
});

const reviewsSlider = new Swiper('.reviews-slider-container', {
  init: false,
  direction: 'vertical',
  loop: true,
  slidesPerView: 3,
  centeredSlides: true,
  spaceBetween: 0,
  speed: 300,
  autoplay: {
    delay: 3500,
    pauseOnMouseEnter: true
  },
  allowTouchMove: false,

  navigation: {
    nextEl: '.reviews-button-next',
    prevEl: '.reviews-button-prev',
  }
});

function isInViewport (el) {
  let rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

const skills = document.querySelectorAll(".skill");

const appendSkillIndicators = () => {
  const svgPiTemplate = document.querySelector(".svg-pi-template").content;

  skills.forEach(e => {
    const clone = svgPiTemplate.cloneNode(true);
    e.appendChild(clone);
  })
}

const changeSkillProgress = () => {
  skills.forEach(e => {
    if (isInViewport(e)) {
      e.querySelector(".svg-pi-indicator").style.setProperty("--progress", e.dataset.progress / 100);
    }
  })
}

const toggleSideNavbarButton = document.querySelector(".toggle-burger");
const sideNavbar = document.querySelector(".side-navbar");
const onToggleBurger = (e) => {
  toggleSideNavbarButton.classList.toggle("toggled");
  sideNavbar.classList.toggle("toggled");
  html.classList.toggle("hide-overflow");
}

const closeSidenav = () => {
  toggleSideNavbarButton.classList.remove("toggled");
  sideNavbar.classList.remove("toggled");
  html.classList.remove("hide-overflow");
}

(async () => {
  await initProjects();
  await initReviews();
  appendSkillIndicators();
  changeScrollVisibility();
  changeSkillProgress();
  document.addEventListener("scroll", changeScrollVisibility);
  document.addEventListener("scroll", changeSkillProgress);
  scrollUpButton.addEventListener("click", scrollUp);
  scrollDownButton.addEventListener("click", scrollDown);
  document.querySelector(".contact-form").addEventListener("submit", onContactFormSubmit);
  document.querySelector(".view-project").addEventListener("click", onViewProject);
  document.querySelector(".toggle-burger").addEventListener("click", onToggleBurger);
  document.querySelectorAll(".side-navbar .links > *").forEach(e => e.addEventListener("click", closeSidenav));
})()