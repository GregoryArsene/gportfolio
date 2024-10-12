// Constantes pour les CustomEase réutilisées
const customEaseInOut = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
const menuLinkRevealEase = CustomEase.create(
  "custom",
  "M0,0 C0.25,0.1 0.25,1 1,1"
);

// Lenis initialization
function initLenis() {
  const lenis = new Lenis({
    lerp: 0.09,
    orientation: "vertical",
    wheelMultiplier: 1.7,
  });

  requestAnimationFrame(function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  });

  return lenis;
}

function initMenu(lenis) {
  const menu = document.querySelector(".menu");
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuElements = {
    triggerText: document.querySelectorAll(".menu-trigger-text"),
    linkTitles: document.querySelectorAll(".menu-link-title"),
    social: document.querySelectorAll("[menu-social]"),
  };

  let isMenuOpen = false;

  function animateMenu(open) {
    let animation = gsap.timeline();

    if (open) {
      animation
        .to(menu, { x: "0%", opacity: 1, duration: 0.8, ease: customEaseInOut })
        .to(
          menuElements.triggerText,
          {
            y: "-100%",
            duration: 0.5,
            ease: menuLinkRevealEase,
          },
          0
        )
        .fromTo(
          [...menuElements.linkTitles, ...menuElements.social],
          { y: "150%" },
          { y: "0%", duration: 0.5, stagger: 0.05, ease: menuLinkRevealEase },
          0.2
        );
    } else {
      animation
        .to(menu, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.inOut",
          onComplete: () => gsap.set(menu, { x: "100%" }),
        })
        .to(
          menuElements.triggerText,
          { y: "0%", duration: 0.3, ease: "power2.inOut" },
          0
        );
    }

    return animation;
  }

  function toggleMenu() {
    isMenuOpen ? closeMenu() : openMenu();
  }

  function openMenu() {
    if (!isMenuOpen) {
      isMenuOpen = true;
      document.body.classList.add("menu-open");
      lenis.stop();
      animateMenu(true);
    }
  }

  function closeMenu() {
    if (isMenuOpen) {
      isMenuOpen = false;
      return animateMenu(false).then(() => {
        // Retourner une promesse
        document.body.classList.remove("menu-open");
        lenis.start();
      });
    } else {
      return Promise.resolve(); // Retourner une promesse résolue si le menu est déjà fermé
    }
  }

  menuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener("click", (e) => {
    if (isMenuOpen && !menu.contains(e.target) && e.target !== menuTrigger) {
      closeMenu();
    }
  });

  // Gestion des clics sur les liens du menu
  menu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      const link = e.target;
      const href = link.getAttribute("href");
      if (href) {
        if (link.classList.contains("secondary-nav-item")) {
          e.stopPropagation(); // Arrêter la propagation pour les liens secondaires uniquement
          return;
        }
        e.preventDefault();
        closeMenu();
        // Délai pour laisser le temps à l'animation de fermeture du menu de se terminer
        setTimeout(() => {
          barba.go(href);
        }, 300);
      }
    }
  });

  return { openMenu, closeMenu };
}

// Barba initialization
function initBarba(lenis, closeMenu) {
  barba.hooks.before((data) => {
    lenis.stop();
    saveScrollPosition(data.current.url.path);
  });

  barba.hooks.after((data) => {
    closeMenu();
    lenis.start();

    if (data.trigger === "back" || data.trigger === "forward") {
      restoreScrollPosition(data.next.url.path);
    } else {
      window.scrollTo(0, 0);
    }

    // Initialiser les éléments spécifiques à la page après la transition Barba
    initMediaControls();
    initProjectPageHero();
  });

  barba.init({
    transitions: [
      {
        preventRunning: true,
        async leave() {
          await pageEnterAnimation().catch(console.error);
        },
        enter(data) {
          updateCurrentClass();
          const nextContainer = data.next.container;

          resetWebflow(data);

          gsap.to(nextContainer, {
            onComplete: () => {
              pageExitAnimation();
              initLogoReveal();
              initLinesAnimations();
            },
          });
        },
      },
    ],
    prefetch: true,
  });
}

// Save scroll position
function saveScrollPosition(path) {
  sessionStorage.setItem("scrollPosition_" + path, window.pageYOffset);
}

// Restore scroll position
function restoreScrollPosition(path) {
  const savedPosition = sessionStorage.getItem("scrollPosition_" + path);
  if (savedPosition !== null) {
    window.scrollTo(0, parseInt(savedPosition));
  } else {
    window.scrollTo(0, 0);
  }
}

barba.hooks.after((data) => {
  const video = document.getElementById("myVideo");
  if (video) {
    video.load();
    video.play();
  }
});

window.addEventListener("popstate", () => {
  const navigationType = performance.getEntriesByType("navigation")[0].type;
  barba.go(window.location.href, { trigger: navigationType });
  initLinesAnimations();
  initLogoReveal();
});

// Animations initialization
function initLinesAnimations() {
  function initSplitText(selector, animationProps) {
    document.querySelectorAll(selector).forEach((element) => {
      if (element._splitType) {
        SplitType.revert(element);
      }
      const split = new SplitType(element, { types: "lines" });
      split.lines.forEach((line, index) => {
        const lineWrapper = document.createElement("div");
        lineWrapper.style.overflow = "hidden";
        line.parentNode.insertBefore(lineWrapper, line);
        lineWrapper.appendChild(line);

        gsap.fromTo(
          line,
          { y: animationProps.fromY },
          {
            y: "0%",
            duration: animationProps.duration,
            ease: customEaseInOut,
            delay:
              animationProps.baseDelay + index * animationProps.staggerDelay,
            scrollTrigger: animationProps.scrollTrigger,
          }
        );
      });
    });
  }

  initSplitText("[line-text]", {
    fromY: "300%",
    duration: 0.8,
    baseDelay: 0.4,
    staggerDelay: 0.1,
  });
}

// Logo Reveal
function initLogoReveal() {
  const tl = gsap.timeline();

  tl.fromTo(
    [".logo-path-1", ".logo-path-2", ".logo-path-3"],
    { y: "120%" },
    {
      y: "0%",
      ease: menuLinkRevealEase,
      stagger: 0.1,
      delay: 0.2,
      duration: 0.8,
    }
  );
}

// Project page hero animation
function initProjectPageHero() {
  const projectHeroImg = document.querySelector(".project-hero-img");
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

// Media controls initialization
function initMediaControls() {
  const video = document.getElementById("myVideo");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const timeRemaining = document.getElementById("timeRemaining");

  if (video && playPauseBtn && timeRemaining) {
    gsap.set([playPauseBtn, timeRemaining], { opacity: 0 });

    video.pause();
    playPauseBtn.textContent = "Play";

    video.addEventListener("click", () => {
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

    video.addEventListener("mouseenter", () => {
      gsap.to([playPauseBtn, timeRemaining], { opacity: 1, duration: 0.2 });
    });

    video.addEventListener("mouseleave", () => {
      gsap.to([playPauseBtn, timeRemaining], {
        opacity: 0,
        duration: 0.2,
        delay: 0.5,
      });
    });
  }
}

// Page enter animation
async function pageEnterAnimation() {
  return gsap
    .timeline()
    .set(".page-transition", { display: "block" })
    .to(".page-transition", {
      duration: 0.8,
      y: "0%",
      ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
    })
    .fromTo(
      ".page-content",
      { y: "0vh" },
      {
        duration: 0.8,
        y: "-100vh",
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
      },
      "-=0.8"
    )
    .fromTo(
      ".opacity-transition",
      { opacity: 0, display: "block" },
      { opacity: 0.8, duration: 1, ease: "linear", display: "none" },
      "-=1"
    );
}

// Page exit animation
async function pageExitAnimation() {
  return gsap
    .timeline()
    .set(".page-transition", { y: "0%" })
    .to(".page-transition", {
      duration: 0.8,
      y: "-100%",
      ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
    })
    .fromTo(
      ".page-content",
      { y: "50vh" },
      {
        duration: 0.8,
        y: "0vh",
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
      },
      "-=0.8"
    )
    .to(
      ".opacity-transition",
      { duration: 1, opacity: 0, ease: "linear" },
      "-=1"
    )
    .set(".page-transition", { display: "none", y: "100%" });
}

// Update current class
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

// Reset Webflow
function resetWebflow(data) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data.next.html, "text/html");
  const webflowPageId = dom.querySelector("html").getAttribute("data-wf-page");
  if (window.Webflow) {
    document.documentElement.setAttribute("data-wf-page", webflowPageId);
    window.Webflow.destroy();
    window.Webflow.ready();
    window.Webflow.require("ix2").init();
  }
}

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  const lenis = initLenis();
  const { openMenu, closeMenu } = initMenu(lenis);
  initBarba(lenis, closeMenu);
  initLinesAnimations();
  initLogoReveal();

  // Initialiser les éléments spécifiques à la page au chargement initial
  initMediaControls();
  initProjectPageHero();
});
