const customEaseInOut = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
const menuLinkRevealEase = CustomEase.create(
  "custom",
  "M0,0 C0.25,0.1 0.25,1 1,1"
);
const labLetterEase = CustomEase.create(
  "custom",
  "M0,0 C0.368,0.02 0.011,0.997 1,1"
);

function isWebflowCSSLoaded() {
  const cssLoaded = !!document.querySelector(".page-code-preloader");
  return cssLoaded;
}

function initPreloader() {
  document.fonts.ready.then(() => {
    if (isWebflowCSSLoaded()) {
      document.documentElement.classList.add("is-ready");
    } else {
      const checkInterval = setInterval(() => {
        if (isWebflowCSSLoaded()) {
          document.documentElement.classList.add("is-ready");
          clearInterval(checkInterval);
        }
      }, 100);
    }
  });
}

function initLenis() {
  const lenis = new Lenis({
    lerp: 0.09,
    orientation: "vertical",
    wheelMultiplier: 1.7,
    smoothTouch: true,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

// Définition de la fonction forceCloseMenu
function forceCloseMenu(menu, menuTrigger) {
  const isMenuOpen = document.body.classList.contains("menu-open"); // Vérifie si le menu est ouvert
  if (isMenuOpen) {
    gsap.to(menu, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(menu, { x: "100%" });
        document.body.classList.remove("menu-open");
        // Gestion du focus
        menu.setAttribute("aria-hidden", "true");
        menuTrigger.setAttribute("aria-expanded", "false");
        menuTrigger.focus(); // Remet le focus sur le bouton
      },
    });
    gsap.to(".menu-trigger_text", {
      y: "0%",
      duration: 0.3,
      ease: "power2.inOut",
    });
  }
}

function initMenu(lenis) {
  const menu = document.querySelector(".menu");
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuElements = {
    triggerText: document.querySelectorAll(".menu-trigger_text"),
    linkTitles: document.querySelectorAll(".primary-nav_title"),
    social: document.querySelectorAll(".secondary-nav_title"),
  };

  let isMenuOpen = false;
  let menuAnimation = null;

  // Assurez-vous que le menu est focusable
  menu.setAttribute("tabindex", "-1");

  function animateMenu(open) {
    if (menuAnimation) menuAnimation.kill();

    menuAnimation = gsap.timeline({
      onComplete: () => {
        menuAnimation = null;
      },
    });

    if (open) {
      menuAnimation
        .to(menu, {
          x: "0%",
          opacity: 1,
          duration: 0.8,
          ease: customEaseInOut,
        })
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
          {
            y: "0%",
            duration: 0.5,
            stagger: 0.05,
            ease: menuLinkRevealEase,
          },
          0.2
        );
    } else {
      menuAnimation
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

    return menuAnimation;
  }

  function toggleMenu() {
    isMenuOpen ? closeMenu() : openMenu();
  }

  function openMenu() {
    if (!isMenuOpen) {
      isMenuOpen = true;
      document.body.classList.add("menu-open");
      animateMenu(true);
      // Gestion du focus
      menu.setAttribute("aria-hidden", "false");
      menuTrigger.setAttribute("aria-expanded", "true");
      menu.focus(); // Met le focus sur le menu
    }
  }

  function closeMenu() {
    if (isMenuOpen) {
      isMenuOpen = false;
      return animateMenu(false).then(() => {
        document.body.classList.remove("menu-open");
        // Gestion du focus
        menu.setAttribute("aria-hidden", "true");
        menuTrigger.setAttribute("aria-expanded", "false");
        menuTrigger.focus(); // Remet le focus sur le bouton
      });
    }
    return Promise.resolve();
  }

  // Gestionnaire de redimensionnement
  function handleResize() {
    if (window.innerWidth > 568 && isMenuOpen) {
      // Si l'écran est plus large que 568px et que le menu est ouvert, fermez-le
      forceCloseMenu(menu, menuTrigger);
    }
  }

  // Ajoutez l'écouteur d'événement pour le redimensionnement
  window.addEventListener("resize", handleResize);

  const handleMenuInteractions = (e) => {
    if (menuTrigger.contains(e.target)) {
      e.stopPropagation();
      toggleMenu();
      return;
    }

    if (isMenuOpen && !menu.contains(e.target)) {
      closeMenu();
      return;
    }

    if (e.target.tagName === "A" && menu.contains(e.target)) {
      const link = e.target;
      const href = link.getAttribute("href");

      if (href) {
        if (!link.classList.contains("secondary-nav_link")) {
          e.preventDefault();
          closeMenu();
          setTimeout(() => {
            barba.go(href);
          }, 300);
        }
      }
    }
  };

  document.addEventListener("click", handleMenuInteractions);

  return { openMenu, closeMenu, forceCloseMenu };
}

function initBarba(lenis, closeMenu) {
  barba.hooks.before((data) => {
    lenis.stop();
    saveScrollPosition(data.current.url.path);
  });

  barba.hooks.after((data) => {
    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";
    lenis.start();

    // Fermez le menu après chaque transition de page
    const menu = document.querySelector(".menu");
    const menuTrigger = document.querySelector(".menu-trigger");
    forceCloseMenu(menu, menuTrigger);

    if (data.trigger === "back" || data.trigger === "forward") {
      restoreScrollPosition(data.next.url.path);
    } else {
      window.scrollTo(0, 0); // Scroll vers le haut de la page
    }

    requestAnimationFrame(() => {
      const pageInitFunctions = [
        initProjectPageHero,
        initProjectDisplay,
        initDisplayHover,
        initLinesAnimations,
        initVideoPlayer,
        // initLabLetter, // Supprimé car déjà appelé dans la transition 'enter'
      ];

      pageInitFunctions.forEach((func) => {
        try {
          func();
        } catch (error) {
          console.error(`Error in page initialization: ${func.name}`, error);
        }
      });
    });
  });

  barba.init({
    prefetchIgnore: true,
    transitions: [
      {
        preventRunning: true,
        async leave(data) {
          await pageEnterAnimation().catch(console.error);
        },
        enter(data) {
          updateCurrentClass();
          const nextContainer = data.next.container;

          resetWebflow(data);

          gsap.to(nextContainer, {
            onComplete: () => {
              pageExitAnimation();
              initLinesAnimations();
              initProjectDisplay();
              projectIndex();
              initLabLetter();
              initVideoPlayer();
              // Fermez le menu à l'entrée d'une nouvelle page si on est sur desktop
              if (window.innerWidth > 568) {
                const menu = document.querySelector(".menu");
                const menuTrigger = document.querySelector(".menu-trigger");
                forceCloseMenu(menu, menuTrigger);
              }
            },
          });
        },
      },
    ],
    prefetch: true,
    debug: false,
  });
}

function saveScrollPosition(path) {
  sessionStorage.setItem("scrollPosition_" + path, window.pageYOffset);
}

function restoreScrollPosition(path) {
  const savedPosition = sessionStorage.getItem("scrollPosition_" + path);
  if (savedPosition !== null) {
    window.scrollTo(0, parseInt(savedPosition));
  } else {
    window.scrollTo(0, 0);
  }
}

window.addEventListener("popstate", () => {
  const navigationType = performance.getEntriesByType("navigation")[0].type;
  barba.go(window.location.href, { trigger: navigationType });
  initLinesAnimations();
});

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

  initSplitText("[line-text-2]", {
    fromY: "300%",
    duration: 0.8,
    baseDelay: 0.5,
    staggerDelay: 0.1,
  });
}

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

  // État initial
  gridBtn.classList.add("btn_selected");
  gridBtn.classList.remove("btn_not-selected");
  indexBtn.classList.add("btn_not-selected");
  indexBtn.classList.remove("btn_selected");

  function switchButtons(selectedBtn, unselectedBtn) {
    selectedBtn.classList.add("btn_selected");
    selectedBtn.classList.remove("btn_not-selected");
    unselectedBtn.classList.add("btn_not-selected");
    unselectedBtn.classList.remove("btn_selected");
  }

  indexBtn.addEventListener("click", () => {
    // Transition du contenu
    indexContent.style.display = "block";
    projectsContent.classList.add("inactive");
    requestAnimationFrame(() => {
      indexContent.classList.add("active");
      indexContent.classList.remove("inactive");
    });

    setTimeout(() => {
      projectsContent.style.display = "none";
    }, 250);

    // Basculement des classes
    switchButtons(indexBtn, gridBtn);
  });

  gridBtn.addEventListener("click", () => {
    // Transition du contenu
    projectsContent.style.display = "block";
    indexContent.classList.add("inactive");
    requestAnimationFrame(() => {
      projectsContent.classList.add("active");
      projectsContent.classList.remove("inactive");
    });

    setTimeout(() => {
      indexContent.style.display = "none";
    }, 250);

    // Basculement des classes
    switchButtons(gridBtn, indexBtn);
  });
}

function projectIndex() {
  const projectItems = document.querySelectorAll(".projects-index_item");

  projectItems.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      document.querySelector(`#index-img-${index + 1}`).style.opacity = "1";
    });

    item.addEventListener("mouseleave", () => {
      document.querySelector(`#index-img-${index + 1}`).style.opacity = "0";
    });
  });
}

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

    gsap.set([playPauseBtn, timeRemaining], { opacity: 0 }); // Initialement cachés

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

    videoPlayer.addEventListener("mouseenter", () => {
      gsap.to([playPauseBtn, timeRemaining], { opacity: 1, duration: 0.5 });
      clearTimeout(timeout); // Annule le timeout de disparition si la souris revient
    });

    videoPlayer.addEventListener("mouseleave", () => {
      timeout = setTimeout(() => {
        gsap.to([playPauseBtn, timeRemaining], { opacity: 0, duration: 1 });
      }, 3000);
    });
  });
}
function initLabLetter() {
  // Animation pour lab-letter-left
  gsap.fromTo(
    "#lab-letter-left",
    {
      x: "15vw",
    },
    {
      x: 0,
      duration: 2,
      ease: labLetterEase, // ← Ici la référence
      scrollTrigger: {
        trigger: ".home-lab_btm",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );

  // Animation pour lab-letter-right
  gsap.fromTo(
    "#lab-letter-right",
    {
      x: "-15vw",
    },
    {
      x: 0,
      duration: 2,
      ease: labLetterEase, // ← Ici la référence
      scrollTrigger: {
        trigger: ".home-lab_btm",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

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

function resetWebflow(data) {
  try {
    const parser = new DOMParser();
    const dom = parser.parseFromString(data.next.html, "text/html");
    const webflowPageId = dom
      .querySelector("html")
      ?.getAttribute("data-wf-page");

    if (webflowPageId) {
      document.documentElement.setAttribute("data-wf-page", webflowPageId);
    }

    if (window.Webflow) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require("ix2")?.init();
    }
  } catch (error) {
    console.error("Webflow reset error:", error);
  }
}

window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
});

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();

  const lenis = initLenis();
  const { openMenu, closeMenu } = initMenu(lenis);

  requestAnimationFrame(() => {
    initBarba(lenis, closeMenu);
    initLinesAnimations();
    initProjectPageHero();
    initLabLetter();
    initVideoPlayer(); // Initialisation au chargement de la page

    if (document.querySelector(".projects-display_btn.is--index")) {
      initProjectDisplay();
    }
    if (document.querySelector(".projects-display_btn.is--grid")) {
      initDisplayHover();
    }
    projectIndex();
  });
});
