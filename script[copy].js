// --- Helpers ---
// Fonction debounce optimisée avec option 'immediate'
const debounce = (func, delay, immediate = false) => {
  let debounceTimer;
  return function (...args) {
    const callNow = immediate && !debounceTimer;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (!immediate) func.apply(this, args);
    }, delay);
    if (callNow) func.apply(this, args);
  };
};

// --- Custom Easings ---
// Ease personnalisé pour une transition douce entrée-sortie
const customEaseInOut = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");

// Ease pour la révélation des liens du menu
const menuLinkRevealEase = CustomEase.create(
  "custom",
  "M0,0 C0.25,0.1 0.25,1 1,1"
);

// Ease pour l'animation des lettres du lab
const labLetterEase = CustomEase.create(
  "custom",
  "M0,0 C0.368,0.02 0.011,0.997 1,1"
);

// --- Lenis (Smooth Scroll) ---
// Initialisation de Lenis avec paramètres documentés
let lenis;
function initLenis() {
  const lenisInstance = new Lenis({
    lerp: 0.09, // Valeur entre 0 et 1, plus petit = plus fluide
    orientation: "vertical",
    wheelMultiplier: 1.7, // Sensibilité de la molette
    smoothTouch: true,
    smoothWheel: true,
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  return lenisInstance;
}

// --- Menu Module ---
// Module de menu optimisé avec réutilisation des timelines et gestion de la touche Échap
function initMenu() {
  const menu = document.querySelector(".menu");
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuElements = {
    triggerText: document.querySelectorAll(".menu-trigger_text"),
    linkTitles: document.querySelectorAll(".primary-nav_title"),
    linkNumbers: document.querySelectorAll(".primary-nav_num"),
    social: document.querySelectorAll(".secondary-nav_title"),
  };

  let isMenuOpen = false;
  const openTimeline = gsap.timeline({ paused: true });
  const closeTimeline = gsap.timeline({ paused: true });

  // Création des timelines une seule fois
  openTimeline
    .to(menu, { x: "0%", opacity: 1, duration: 0.8, ease: customEaseInOut })
    .to(
      menuElements.triggerText,
      { y: "-100%", duration: 0.5, ease: menuLinkRevealEase },
      0
    )
    .fromTo(
      [
        ...menuElements.linkTitles,
        ...menuElements.linkNumbers,
        ...menuElements.social,
      ],
      { y: "150%" },
      { y: "0%", duration: 0.5, stagger: 0.05, ease: menuLinkRevealEase },
      0.2
    );

  closeTimeline
    .to(menu, { opacity: 0, duration: 0.2, ease: "power2.inOut" })
    .to(
      menuElements.triggerText,
      { y: "0%", duration: 0.3, ease: "power2.inOut" },
      0
    )
    .set(menu, { x: "100%" });

  function openMenuF() {
    if (!isMenuOpen) {
      isMenuOpen = true;
      document.body.classList.add("menu-open");
      openTimeline.restart();
      menu.setAttribute("aria-hidden", "false");
      menuTrigger.setAttribute("aria-expanded", "true");
      menu.focus();
    }
  }

  function closeMenuF(force = false) {
    if (isMenuOpen) {
      isMenuOpen = false;
      if (force) {
        closeTimeline.duration(0.25).restart();
      } else {
        closeTimeline.duration(0.2).restart();
      }
      document.body.classList.remove("menu-open");
      menu.setAttribute("aria-hidden", "true");
      menuTrigger.setAttribute("aria-expanded", "false");
      menuTrigger.focus();
    }
  }

  // Gestion de la touche Échap pour fermer le menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      closeMenuF();
    }
  });

  // Utilisation d'un debounce pour limiter l'évènement resize
  const handleResize = debounce(() => {
    if (window.innerWidth > 568 && isMenuOpen) {
      closeMenuF(true); // Force la fermeture rapide
    }
  }, 200);
  window.addEventListener("resize", handleResize);

  // Délégation de l'évènement click pour gérer les interactions liées au menu
  document.addEventListener("click", (e) => {
    if (menuTrigger.contains(e.target)) {
      e.stopPropagation();
      isMenuOpen ? closeMenuF() : openMenuF();
      return;
    }
    if (isMenuOpen && !menu.contains(e.target)) {
      closeMenuF();
    }
  });

  return {
    openMenu: openMenuF,
    closeMenu: closeMenuF,
  };
}

// --- Lines Animations ---
// Fonction optimisée avec IntersectionObserver pour ne splitter que les éléments visibles
function initLinesAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const split = new SplitType(element, { types: "lines" });
        split.lines.forEach((line, index) => {
          const lineWrapper = document.createElement("div");
          lineWrapper.style.overflow = "hidden";
          line.parentNode.insertBefore(lineWrapper, line);
          lineWrapper.appendChild(line);
          gsap.fromTo(
            line,
            { y: "300%" },
            {
              y: "0%",
              duration: 0.8,
              ease: customEaseInOut,
              delay: 0.4 + index * 0.1,
            }
          );
        });
        observer.unobserve(element);
      }
    });
  });

  document.querySelectorAll("[line-text], [line-text-2]").forEach((element) => {
    observer.observe(element);
  });
}

// --- Project Display ---
// Fonction avec transitions CSS pour les sections
function initProjectDisplay() {
  const indexBtn = document.querySelector(".projects-display_btn.is--index");
  const gridBtn = document.querySelector(".projects-display_btn.is--grid");
  const indexContent = document.querySelector(".index");
  const projectsContent = document.querySelector(".projects");

  if (!indexBtn || !gridBtn || !indexContent || !projectsContent) {
    console.warn(
      "Les éléments nécessaires pour initProjectDisplay sont absents de cette page."
    );
    return;
  }

  const switchButtons = (selectedBtn, unselectedBtn) => {
    selectedBtn.classList.add("btn_selected");
    selectedBtn.classList.remove("btn_not-selected");
    unselectedBtn.classList.add("btn_not-selected");
    unselectedBtn.classList.remove("btn_selected");
  };

  const handleIndexClick = () => {
    indexContent.style.display = "block";
    projectsContent.classList.add("inactive");
    requestAnimationFrame(() => {
      indexContent.classList.add("active");
      indexContent.classList.remove("inactive");
    });
    setTimeout(() => {
      projectsContent.style.display = "none";
    }, 250);
    switchButtons(indexBtn, gridBtn);
  };

  const handleGridClick = () => {
    projectsContent.style.display = "block";
    indexContent.classList.add("inactive");
    requestAnimationFrame(() => {
      projectsContent.classList.add("active");
      projectsContent.classList.remove("inactive");
    });
    setTimeout(() => {
      indexContent.style.display = "none";
    }, 250);
    switchButtons(gridBtn, indexBtn);
  };

  // Initialisation de l'état des boutons
  gridBtn.classList.add("btn_selected");
  gridBtn.classList.remove("btn_not-selected");
  indexBtn.classList.add("btn_not-selected");
  indexBtn.classList.remove("btn_selected");

  indexBtn.addEventListener("click", handleIndexClick);
  gridBtn.addEventListener("click", handleGridClick);
}

// --- Project Index ---
// Fonction avec transition CSS pour l'opacité des images
function projectIndex() {
  const projectItems = document.querySelectorAll(".projects-index_item");
  projectItems.forEach((item, index) => {
    const indexImg = document.querySelector(`#index-img-${index + 1}`);
    if (!indexImg) return;
    const handleMouseEnter = () => (indexImg.style.opacity = "1");
    const handleMouseLeave = () => (indexImg.style.opacity = "0");
    item.addEventListener("mouseenter", handleMouseEnter);
    item.addEventListener("mouseleave", handleMouseLeave);
  });
}

// --- Project Page Hero Parallax ---
// Animation parallax pour l'image héroïque d'une page projet
function initProjectPageHero() {
  const projectHeroImg = document.querySelector(".hero-project_img");
  if (projectHeroImg) {
    gsap
      .timeline()
      .to(projectHeroImg, {
        duration: 1.2,
        scale: 1,
        delay: 0.9,
        ease: customEaseInOut,
      })
      .to(projectHeroImg, {
        y: "-8%",
        scrollTrigger: {
          trigger: projectHeroImg,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.1,
          ease: "none",
        },
      });
  }
}

// --- Video Player ---
// Gestion optimisée d'un lecteur vidéo avec contrôles
function initVideoPlayer() {
  document.querySelectorAll(".video-player").forEach((videoPlayer) => {
    const video = videoPlayer.querySelector("video");
    const playPauseBtn = videoPlayer.querySelector(".video-controls");
    const timeRemaining = videoPlayer.querySelector(".video-time");
    let timeout;
    if (!video || !playPauseBtn || !timeRemaining) {
      console.warn("Éléments vidéo manquants dans un conteneur .video-player");
      return;
    }
    gsap.set([playPauseBtn, timeRemaining], { opacity: 0 });
    video.pause();
    playPauseBtn.textContent = "Play";

    videoPlayer.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        playPauseBtn.textContent = "Pause";
      } else {
        video.pause();
        playPauseBtn.textContent = "Play";
      }
    });

    video.addEventListener("timeupdate", () => {
      const timeLeft = video.duration - video.currentTime;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = Math.floor(timeLeft % 60);
      timeRemaining.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    });

    video.addEventListener("ended", () => {
      playPauseBtn.textContent = "Replay";
    });

    video.addEventListener("error", (e) => {
      console.error("Erreur de lecture vidéo:", e);
    });

    videoPlayer.addEventListener("mouseenter", () => {
      gsap.to([playPauseBtn, timeRemaining], { opacity: 1, duration: 0.5 });
      clearTimeout(timeout);
    });
    videoPlayer.addEventListener("mouseleave", () => {
      timeout = setTimeout(() => {
        gsap.to([playPauseBtn, timeRemaining], { opacity: 0, duration: 1 });
      }, 3000);
    });
  });
}

// --- Lab Letter Animations ---
// Animation des lettres dans la section lab
function initLabLetter() {
  gsap.fromTo(
    "#lab-letter-left",
    { x: "15vw" },
    {
      x: 0,
      duration: 2,
      ease: labLetterEase,
      scrollTrigger: {
        trigger: ".home-lab_btm",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
  gsap.fromTo(
    "#lab-letter-right",
    { x: "-15vw" },
    {
      x: 0,
      duration: 2,
      ease: labLetterEase,
      scrollTrigger: {
        trigger: ".home-lab_btm",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

// --- Navigation Highlight ---
// Mise en évidence de la page courante dans la navigation
function updateCurrentClass() {
  document
    .querySelectorAll(".w-current")
    .forEach((el) => el.classList.remove("w--current"));
  document.querySelectorAll(".nav a").forEach((el) => {
    if (el.getAttribute("href") === window.location.pathname) {
      el.classList.add("w--current");
    }
  });
}

// --- Webflow Reset ---
// Réinitialisation de Webflow pour éviter les conflits
function resetWebflow() {
  try {
    if (window.Webflow) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require("ix2")?.init();
    }
  } catch (error) {
    console.error("Webflow reset error:", error);
  }
}

// --- Global Error Handler ---
// Gestion globale des erreurs non capturées
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
});

// --- Page Loading & Content Update ---
// Chargement asynchrone d'une nouvelle page avec mise à jour partielle
async function loadNewPage(url, withTransition = false) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const newDocument = new DOMParser().parseFromString(text, "text/html");

    if (withTransition && document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        updateContent(newDocument);
        lenis.scrollTo(0, { immediate: true });
      });
      await transition.finished;
      initLinesAnimations();
    } else {
      updateContent(newDocument);
      lenis.scrollTo(0, { immediate: true });
      initLinesAnimations();
    }
  } catch (error) {
    console.error("Error loading new page:", error);
  }
}

// Mise à jour partielle du contenu
function updateContent(newDocument) {
  const newBody = newDocument.body;
  const oldBody = document.body;

  // Mettre à jour uniquement les sections nécessaires (ex: #main-content)
  const newContent = newBody.querySelector("#main-content");
  const oldContent = oldBody.querySelector("#main-content");
  if (newContent && oldContent) {
    oldContent.innerHTML = newContent.innerHTML;
  } else {
    document.body.innerHTML = newBody.innerHTML;
  }

  document.title = newDocument.title;

  // Réinitialisation des modules après mise à jour
  ({ openMenu, closeMenu } = initMenu());
  updateCurrentClass();
  resetWebflow();
  initProjectPageHero();
  initLabLetter();
  initVideoPlayer();
  initProjectDisplay();
  projectIndex();
}

// --- Application Initialization ---
// Initialisation globale de l'application
function initApp() {
  lenis = initLenis();
  ({ openMenu, closeMenu } = initMenu());
  initProjectPageHero();
  initLabLetter();
  initVideoPlayer();
  initProjectDisplay();
  projectIndex();
  updateCurrentClass();
  resetWebflow();
  initLinesAnimations();
}

document.addEventListener("DOMContentLoaded", initApp);

// --- View Transitions via Navigation API ---
// Gestion des transitions de navigation modernes
if (navigation.addEventListener) {
  navigation.addEventListener("navigate", (event) => {
    const url = new URL(event.destination.url);
    if (location.origin !== url.origin) return;
    if (event.destination.url === window.location.href) return;
    if (
      event.target &&
      event.target.tagName === "A" &&
      event.target.closest(".menu")
    ) {
      return;
    }
    event.intercept({
      async handler() {
        await loadNewPage(event.destination.url, true);
      },
    });
  });
}
