// GSAP & Plugins
// gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip);

// DÉFINITION DE LA CONDITION TACTILE MOBILE
const isTouchMobile =
  window.matchMedia("(max-width: 1023px)").matches &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const debounce = (func, delay, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    }, delay);
    if (callNow) func.apply(this, args);
  };
};

// Cache des CustomEase pour éviter les recréations
const EASES = {
  customInOut: null,
  menuLinkReveal: null,
  reveal: null,

  init() {
    if (!this.customInOut) {
      this.customInOut = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
      this.menuLinkReveal = CustomEase.create(
        "custom",
        "M0,0 C0.25,0.1 0.25,1 1,1"
      );
      this.reveal = CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1");
    }
    return this;
  },
};

let smoother;

function initScrollSmoother() {
  if (smoother) {
    smoother.kill();
    smoother = null;
  }
  if (isTouchMobile) {
    console.log(
      "ScrollSmoother et ScrollTrigger désactivés pour les écrans tactiles < 1024px."
    );
    if (window.ScrollTrigger) {
      ScrollTrigger.disable(true);
    }
    return null;
  }
  console.log("ScrollSmoother activé.");
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
    speed: 1,
    normalizeScroll: true,
  });
  return smoother;
}

// Menu optimisé avec WeakMap pour éviter les fuites mémoire
const menuElementsCache = new WeakMap();

function initMenu() {
  const menuElement = document.querySelector(".menu");
  const triggerElement = document.querySelector(".menu-trigger");

  if (!menuElement || !triggerElement) {
    return {
      openMenu: () => {},
      closeMenu: () => {},
      isMenuOpen: () => false,
    };
  }

  let isMenuOpen = false;

  // Cache des éléments avec WeakMap pour éviter les fuites
  let elements = menuElementsCache.get(menuElement);
  if (!elements) {
    elements = {
      triggerText: document.querySelectorAll(".menu-trigger_text"),
      linkTitles: document.querySelectorAll(".primary-nav_title"),
      linkNumbers: document.querySelectorAll(".primary-nav_num"),
      social: document.querySelectorAll(".secondary-nav_title"),
      label: document.querySelectorAll(".menu-bottom_label"),
    };
    menuElementsCache.set(menuElement, elements);
  }

  // Timelines réutilisables
  const openTimeline = gsap
    .timeline({
      paused: true,
      defaults: { overwrite: "auto" },
      onComplete: () => {
        menuElement.setAttribute("aria-hidden", "false");
        triggerElement.setAttribute("aria-expanded", "true");
      },
    })
    .to(menuElement, {
      x: "0%",
      opacity: 1,
      duration: 0.8,
      ease: EASES.customInOut,
    })
    .to(
      elements.triggerText,
      {
        y: "-100%",
        duration: 0.5,
        ease: EASES.menuLinkReveal,
      },
      0
    )
    .fromTo(
      [
        ...elements.linkTitles,
        ...elements.linkNumbers,
        ...elements.social,
        ...elements.label,
      ],
      { y: "200%" },
      {
        y: "0%",
        duration: 0.5,
        stagger: 0.05,
        ease: EASES.menuLinkReveal,
      },
      0.2
    );

  const closeTimeline = gsap
    .timeline({
      paused: true,
      defaults: { overwrite: "auto" },
      onComplete: () => {
        menuElement.setAttribute("aria-hidden", "true");
        triggerElement.setAttribute("aria-expanded", "false");
        menuElement.style.transform = "translateX(100%)";
      },
    })
    .to(menuElement, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.inOut",
    })
    .to(
      elements.triggerText,
      {
        y: "0%",
        duration: 0.3,
        ease: "power2.inOut",
      },
      0
    );

  const openMenu = () => {
    if (isMenuOpen) return;
    isMenuOpen = true;
    document.body.classList.add("menu-open");
    openTimeline.restart();
  };

  const closeMenu = (fast = false) => {
    if (!isMenuOpen) return;
    isMenuOpen = false;
    closeTimeline.duration(fast ? 0.25 : 0.2).restart();
    document.body.classList.remove("menu-open");
  };

  // Event listeners optimisés
  const handleClick = (event) => {
    if (triggerElement.contains(event.target)) {
      event.stopPropagation();
      isMenuOpen ? closeMenu() : openMenu();
    } else if (isMenuOpen && !menuElement.contains(event.target)) {
      closeMenu();
    }
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape" && isMenuOpen) {
      closeMenu();
    }
  };

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);

  // Cleanup function pour éviter les fuites mémoire
  const cleanup = () => {
    document.removeEventListener("click", handleClick);
    document.removeEventListener("keydown", handleKeydown);
    openTimeline.kill();
    closeTimeline.kill();
    menuElementsCache.delete(menuElement);
  };

  return {
    openMenu,
    closeMenu,
    isMenuOpen: () => isMenuOpen,
    cleanup,
  };
}

function resetWebflow() {
  try {
    window.Webflow?.destroy();
    window.Webflow?.ready();
    window.Webflow?.require("ix2")?.init();
  } catch (error) {
    console.error("Webflow reset error:", error);
  }
}

// Video player optimisé avec cleanup et performance améliorée
function initVideoPlayer() {
  const elements = {
    morphPath1: document.getElementById("morphPath1"),
    morphPath2: document.getElementById("morphPath2"),
    videoControls: document.getElementById("videoControls"),
    videoControlsText: document.getElementById("videoControlsText"),
    videoIndicator: document.getElementById("videoIndicator"),
    videoTitle: document.getElementById("videoTitle"),
    videoDuration: document.getElementById("videoDuration"),
    videoIdTop: document.getElementById("VideoIdTop"),
    videoIdBtm: document.getElementById("VideoIdBtm"),
    video: document.querySelector("video"),
  };

  // Vérification early return si éléments manquants
  if (!elements.video || !elements.morphPath1 || !elements.morphPath2) {
    return {
      play: () => {},
      pause: () => {},
      toggle: () => {},
      isPlaying: () => false,
    };
  }

  let isPlaying = false;
  let hideTimeout = null;
  let isHovering = false;

  // Fonction utilitaire pour formatter le temps
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Gestion optimisée de la visibilité des éléments
  const fadeElements = (elementsArray, opacity, duration = 0.5) => {
    elementsArray.forEach((element) => {
      if (element) {
        gsap.to(element, {
          duration,
          opacity,
          ease: "power2.out",
        });
      }
    });
  };

  const hideTextElements = () => {
    if (!isHovering) {
      fadeElements([elements.videoTitle, elements.videoDuration], 0);
    }
  };

  const showTextElements = () => {
    fadeElements([elements.videoTitle, elements.videoDuration], 1);
  };

  const hideControlElements = () => {
    if (isHovering) return;
    fadeElements(
      [elements.videoIdTop, elements.videoIdBtm, elements.videoControls],
      0
    );
  };

  const showControlElements = () => {
    fadeElements(
      [elements.videoIdTop, elements.videoIdBtm, elements.videoControls],
      1
    );
  };

  // Constantes pour les paths SVG
  const SVG_PATHS = {
    play: {
      path1: "5 2.5 5 12 5 21.5 5 21.5 21 12 5 2.5 5 2.5",
      path2: "11.7 6.5 11.7 17.5 18.1 13.7 21 12 13.7 7.7 11.7 6.5",
    },
    pause: {
      path1: "5 2.5 5 12 5 21.5 8.3 21.5 8.3 2.5 5 2.5 5 2.5",
      path2: "15 2.5 15 21.5 18.3 21.5 18.3 12 18.3 2.5 15 2.5",
    },
  };

  const updateToPlayState = () => {
    const { path1, path2 } = SVG_PATHS.play;
    gsap.to(elements.morphPath1, {
      duration: 0.5,
      attr: { points: path1 },
      ease: "power2.inOut",
    });
    gsap.to(elements.morphPath2, {
      duration: 0.3,
      attr: { points: path2 },
      ease: "power2.inOut",
    });

    isPlaying = false;
    if (elements.videoControlsText)
      elements.videoControlsText.textContent = "PLAY";
    if (elements.videoIndicator)
      elements.videoIndicator.style.borderBottomColor = "";

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    showTextElements();
    showControlElements();
  };

  const updateToPauseState = () => {
    const { path1, path2 } = SVG_PATHS.pause;
    gsap.to(elements.morphPath1, {
      duration: 0.5,
      attr: { points: path1 },
      ease: "power2.inOut",
    });
    gsap.to(elements.morphPath2, {
      duration: 0.5,
      attr: { points: path2 },
      ease: "power2.inOut",
    });

    isPlaying = true;
    if (elements.videoControlsText)
      elements.videoControlsText.textContent = "PAUSE";
    if (elements.videoIndicator)
      elements.videoIndicator.style.borderBottomColor = "red";

    hideTimeout = setTimeout(() => {
      hideTextElements();
      hideControlElements();
    }, 3000);
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        updateToPlayState();
        elements.video.pause();
      } else {
        updateToPauseState();
        await elements.video.play();
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de la vidéo:", error);
      updateToPlayState(); // Reset en cas d'erreur
    }
  };

  // Event listeners optimisés
  const handleVideoClick = () => togglePlayback();

  const handleMouseEnter = () => {
    isHovering = true;
    showTextElements();
    showControlElements();
  };

  const handleMouseLeave = () => {
    isHovering = false;
    if (isPlaying) {
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        hideTextElements();
        hideControlElements();
      }, 3000);
    }
  };

  const handlePlay = () => {
    if (!isPlaying) updateToPauseState();
  };

  const handlePause = () => {
    if (isPlaying) updateToPlayState();
  };

  const handleTimeUpdate = () => {
    if (elements.video && elements.videoDuration) {
      const remainingTime =
        elements.video.duration - elements.video.currentTime;
      elements.videoDuration.textContent = formatTime(remainingTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (elements.videoDuration && elements.video.duration) {
      elements.videoDuration.textContent = formatTime(elements.video.duration);
    }
  };

  // Initialisation
  elements.morphPath1.setAttribute("points", SVG_PATHS.play.path1);
  elements.morphPath2.setAttribute("points", SVG_PATHS.play.path2);
  if (elements.videoControlsText)
    elements.videoControlsText.textContent = "PLAY";

  // Ajout des event listeners
  elements.video.addEventListener("click", handleVideoClick);
  elements.video.addEventListener("mouseenter", handleMouseEnter);
  elements.video.addEventListener("mouseleave", handleMouseLeave);
  elements.video.addEventListener("play", handlePlay);
  elements.video.addEventListener("pause", handlePause);
  elements.video.addEventListener("timeupdate", handleTimeUpdate);
  elements.video.addEventListener("loadedmetadata", handleLoadedMetadata);

  // Initialisation de la durée si déjà chargée
  if (elements.video.duration) {
    handleLoadedMetadata();
  }

  // Cleanup function
  const cleanup = () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    elements.video.removeEventListener("click", handleVideoClick);
    elements.video.removeEventListener("mouseenter", handleMouseEnter);
    elements.video.removeEventListener("mouseleave", handleMouseLeave);
    elements.video.removeEventListener("play", handlePlay);
    elements.video.removeEventListener("pause", handlePause);
    elements.video.removeEventListener("timeupdate", handleTimeUpdate);
    elements.video.removeEventListener("loadedmetadata", handleLoadedMetadata);
  };

  return {
    play: updateToPauseState,
    pause: updateToPlayState,
    toggle: togglePlayback,
    isPlaying: () => isPlaying,
    cleanup,
  };
}

function highlightCurrentPageDot() {
  const pageName =
    window.location.pathname.split("/").pop().replace(".html", "") ||
    "home_page_no_dot";

  // Reset tous les dots
  document.querySelectorAll(".header-item_dot").forEach((dot) => {
    dot.classList.remove("active-dot");
  });

  // Active le dot correspondant
  if (["projects", "about", "lab"].includes(pageName)) {
    const targetDot = document.getElementById(`${pageName}-dot`);
    targetDot?.classList.add("active-dot");
  }
}
function initHeaderAnimation() {
  const logo = document.querySelector(".header-logo");
  const navItems = gsap.utils.toArray(".header_list-item");

  if (!logo && navItems.length === 0) return;

  // Reset styles précédents
  gsap.set([logo, ...navItems], { clearProps: "all" });

  // Animation initiale
  const timeline = gsap.timeline({
    defaults: { overwrite: "auto", ease: EASES.reveal },
  });

  if (logo) {
    gsap.set(logo, { y: "300%" });
    timeline.to(logo, { y: "0%", duration: 0.5 });
  }

  if (navItems.length > 0) {
    gsap.set(navItems, { y: "100%" });
    timeline.to(
      navItems,
      {
        y: "0%",
        duration: 0.5,
        stagger: 0.1,
      },
      logo ? "<0.2" : 0
    );
  }
}

function setupHeaderVisibilityObserver() {
  const headerNav = document.querySelector(".header-nav");
  if (!headerNav) return;

  let isAnimated = false;
  let resizeObserver;

  const handleResize = (entries) => {
    for (const entry of entries) {
      const isVisible = entry.contentRect.height > 0;

      if (isVisible && !isAnimated) {
        isAnimated = true;
        requestAnimationFrame(() => initHeaderAnimation());
      } else if (!isVisible && isAnimated) {
        isAnimated = false;
        const logo = document.querySelector(".header-logo");
        const navItems = gsap.utils.toArray(".header_list-item");
        gsap.set([logo, ...navItems], { clearProps: "all" });
      }
    }
  };

  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(headerNav);

  // Cleanup function
  return () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  };
}

// FONCTION SPLITTEXT RESTAURÉE À L'ORIGINAL
function initSplitTextAnimations() {
  if (isTouchMobile) {
    document
      .querySelectorAll(
        '[data-line-reveal="true"], [data-prevent-flicker="true"]'
      )
      .forEach((el) => {
        gsap.set(el, { visibility: "visible", autoAlpha: 1 });
      });
    const aboutNum = document.querySelector(".about-hero_num");
    if (aboutNum) gsap.set(aboutNum, { autoAlpha: 1 });
    return Promise.resolve();
  }

  if (typeof gsap === "undefined" || typeof SplitText === "undefined")
    return Promise.resolve();
  const e = document.querySelector(".about-hero_num");
  if (e) {
    gsap.set(e, { autoAlpha: 1 });
    const t = new SplitText(e, { type: "chars" });
    gsap.from(t.chars, {
      yPercent: 100,
      stagger: 0.1,
      duration: 0.75,
      ease: CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1"),
    });
  }
  return new Promise((e) => {
    document.fonts.ready.then(() => {
      ScrollTrigger.getAll().forEach((e) => {
        e.vars.trigger &&
          e.vars.trigger.hasAttribute("data-line-reveal") &&
          e.kill();
      }),
        document.querySelectorAll("[data-line-reveal='true']").forEach((e) => {
          if (e.hasAttribute("data-split-processed")) {
            e.removeAttribute("data-split-processed"),
              gsap.set(e, { clearProps: "all" });
            e.querySelectorAll(".line").forEach((e) => {
              e.parentNode &&
                e.parentNode.replaceChild(
                  document.createTextNode(e.textContent),
                  e
                );
            }),
              e.normalize();
          }
        }),
        setTimeout(() => {
          document
            .querySelectorAll("[data-line-reveal='true']")
            .forEach((e) => {
              if (
                !e.hasAttribute("data-split-processed") &&
                (e.offsetParent || 0 !== e.offsetHeight)
              )
                try {
                  SplitText.create(e, {
                    type: "lines",
                    autoSplit: true,
                    mask: "lines",
                    linesClass: "line",
                    onSplit: (t) =>
                      gsap
                        .timeline({
                          scrollTrigger: {
                            trigger: e,
                            start: "top bottom",
                            end: "top 90%",
                            once: !0,
                            refreshPriority: -1,
                          },
                        })
                        .from(t.lines, {
                          yPercent: 110,
                          duration: 0.75,
                          ease: CustomEase.create(
                            "custom",
                            "M0,0 C0.2,0.6 0.34,1 1,1"
                          ),
                          stagger: { amount: 0.2 },
                        }),
                  }),
                    gsap.set(e, { visibility: "visible" }),
                    e.setAttribute("data-split-processed", "true");
                } catch (e) {
                  console.error("Erreur lors de la création de SplitText:", e);
                }
            }),
            ScrollTrigger.refresh(),
            e();
        }, 50);
    });
  });
}

function manageCardHoverAnimations() {
  gsap.utils.toArray(".home-work_card-visual").forEach((t) => {
    t._hoverTimeline?.kill();
    t.removeEventListener("mouseenter", t._mouseEnterHandler);
    t.removeEventListener("mouseleave", t._mouseLeaveHandler);
    const o = t.querySelector(".card-label_path"),
      n = t.querySelector(".card-label_text");
    if (!o || !n) return;
    gsap.set(n, { opacity: 0, y: "20%" });
    gsap.set(o, { drawSVG: "0%" });
    const e = gsap
      .timeline({ paused: !0 })
      .to(o, {
        drawSVG: "100%",
        duration: 0.75,
        ease: CustomEase.create("custom", "M0,0 C0.45,0 0,1 1,1"),
      })
      .to(
        n,
        { opacity: 1, y: "0%", duration: 0.3, ease: EASES.reveal },
        "<0.2"
      );
    t._hoverTimeline = e;
    t._mouseEnterHandler = () => e.play();
    t._mouseLeaveHandler = () => e.reverse();
    t.addEventListener("mouseenter", t._mouseEnterHandler);
    t.addEventListener("mouseleave", t._mouseLeaveHandler);
  });
}

function initHomeHeroAnimations() {
  const e = document.querySelector(".home-hero_path"),
    t = document.querySelector(".home-hero_text"),
    o = document.querySelector(".main-cta");
  if (!e || !t) return;
  const n = gsap.timeline({ delay: 1.5 });
  n.from(e, {
    drawSVG: "0%",
    autoAlpha: 0,
    duration: 0.75,
    ease: CustomEase.create("custom", "M0,0 C0.45,0 0,1 1,1"),
  });
  n.from(
    t,
    { y: "20%", autoAlpha: 0, duration: 0.75, ease: EASES.reveal },
    "<0.1"
  );
  if (o) gsap.to(o, { y: "0%", duration: 0.75, ease: EASES.reveal });
}

function initViewSwitcher() {
  const gridBtn = document.querySelector(".btn-view-grid");
  const indexBtn = document.querySelector(".btn-view-index");
  const gridView = document.querySelector(".work-grid");
  const indexView = document.querySelector(".work-index");
  const container = document.querySelector(".work-views-container");

  if (!gridBtn || !indexBtn || !gridView || !indexView || !container) return;

  const buttons = [gridBtn, indexBtn];
  let currentView = "grid"; // État initial

  // Définir l'état initial
  gridBtn.classList.add("is-active");

  const switchView = (targetView, targetElement, currentElement) => {
    if (currentView === targetView) return;

    // Mesure des hauteurs
    gsap.set(targetElement, {
      position: "relative",
      visibility: "hidden",
      opacity: 1,
    });
    const targetHeight = targetElement.offsetHeight;

    gsap.set(targetElement, {
      position: "absolute",
      visibility: "hidden",
      opacity: 0,
    });

    const currentHeight = currentElement.offsetHeight;

    // Configuration initiale pour l'animation
    gsap.set(container, { height: currentHeight });
    gsap.set([targetElement, currentElement], { position: "absolute" });

    // Animation de transition
    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(targetElement, {
          position: "relative",
          clearProps: "height,width,top,left",
        });
        gsap.set(container, { clearProps: "height" });
        gsap.set(currentElement, { visibility: "hidden" });
        ScrollTrigger.refresh();
      },
    });

    timeline
      .to(container, {
        height: targetHeight,
        duration: 0.4,
        ease: "power2.inOut",
      })
      .to(
        currentElement,
        {
          opacity: 0,
          duration: 0.3,
        },
        0
      )
      .to(
        targetElement,
        {
          opacity: 1,
          visibility: "visible",
          duration: 0.3,
        },
        0.1
      );

    currentView = targetView;
  };

  // Event listeners optimisés
  const handleGridClick = () => {
    if (currentView !== "grid") {
      buttons.forEach((btn) => btn.classList.remove("is-active"));
      gridBtn.classList.add("is-active");
      switchView("grid", gridView, indexView);
    }
  };

  const handleIndexClick = () => {
    if (currentView !== "index") {
      buttons.forEach((btn) => btn.classList.remove("is-active"));
      indexBtn.classList.add("is-active");
      switchView("index", indexView, gridView);
    }
  };

  gridBtn.addEventListener("click", handleGridClick);
  indexBtn.addEventListener("click", handleIndexClick);

  // Cleanup function
  return () => {
    gridBtn.removeEventListener("click", handleGridClick);
    indexBtn.removeEventListener("click", handleIndexClick);
  };
}

function initLabGallery() {
  const galleryContainer = document.querySelector(".lab-gallery_content");
  if (!galleryContainer) return;

  const gridItems = Array.from(
    galleryContainer.querySelectorAll(".lab-grid_item")
  );
  if (gridItems.length === 0) return;

  function buildColumns() {
    // --- MODIFICATION 1 : Lire les styles de la grille AVANT de la modifier ---
    const computedStyles = window.getComputedStyle(galleryContainer);
    const numColumns = computedStyles
      .getPropertyValue("grid-template-columns")
      .split(" ")
      .filter((val) => "0px" !== val && val).length;

    if (numColumns === 0) return;

    // On récupère les valeurs de gap pour les réappliquer plus tard
    const verticalGap = computedStyles.getPropertyValue("row-gap");
    const horizontalGap = computedStyles.getPropertyValue("column-gap");

    // --- Fin de la modification 1 ---

    const columnsData = Array.from({ length: numColumns }, () => []);
    gridItems.forEach((item, index) => {
      columnsData[index % numColumns].push(item);
    });

    const fragment = document.createDocumentFragment();
    const centerIndex = (numColumns - 1) / 2;
    const smootherEffects = [];

    columnsData.forEach((items, index) => {
      const column = document.createElement("div");
      column.className = "lab-gallery_column";

      // --- MODIFICATION 2 : Appliquer le gap vertical à chaque nouvelle colonne ---
      // Pour que le gap fonctionne, la colonne doit être un conteneur (flex ou grid)
      column.style.display = "flex";
      column.style.flexDirection = "column";
      column.style.gap = verticalGap; // Applique l'espacement entre les items de la colonne
      // --- Fin de la modification 2 ---

      items.forEach((item) => column.appendChild(item));
      fragment.appendChild(column);

      const lag = 0 + 0.05 * Math.abs(index - centerIndex);
      smootherEffects.push({ element: column, lag: lag });
    });

    galleryContainer.innerHTML = "";
    galleryContainer.appendChild(fragment);

    // --- MODIFICATION 3 : Appliquer le gap horizontal entre les colonnes ---
    galleryContainer.style.display = "flex";
    galleryContainer.style.gap = horizontalGap; // Applique l'espacement entre les colonnes
    // --- Fin de la modification 3 ---

    if (smoother) {
      smootherEffects.forEach(({ element, lag }) => {
        smoother.effects(element, { speed: 1, lag: lag });
      });
    }
    galleryContainer.classList.add("gallery-is-ready");
  }

  document.fonts.ready.then(() => {
    setTimeout(buildColumns, 50);
  });
}

// FONCTION REGROUPANT LES AUTRES ANIMATIONS DÉPENDANTES DU SCROLL
function initializeScrollDependentAnimations() {
  if (isTouchMobile) {
    gsap.set('[data-anim-stroke="true"]', { "--stroke-width": "100%" });
    gsap.set("[data-illustration]", { y: "0%", autoAlpha: 1 });
    document
      .querySelectorAll("[data-image-loader]")
      .forEach((loader) => loader.classList.add("is-loaded"));
    return;
  }

  ScrollTrigger.batch('[data-anim-stroke="true"]', {
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        "--stroke-width": "100%",
        duration: 0.75,
        ease: EASES.reveal,
        stagger: 0.2,
      }),
  });

  gsap.utils.toArray("[data-illustration]").forEach((el) => {
    gsap.from(el, {
      y: "200%",
      autoAlpha: 0,
      duration: 0.5,
      ease: EASES.reveal,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });

  document.querySelectorAll("[data-image-loader]").forEach((loader) => {
    const img = loader.querySelector("img");
    if (!img) return;
    const showImage = () =>
      !loader.classList.contains("is-loaded") &&
      loader.classList.add("is-loaded");
    ScrollTrigger.create({
      trigger: loader,
      start: "top 85%",
      once: true,
      onEnter: () =>
        img.complete
          ? showImage()
          : img.addEventListener("load", showImage, { once: true }),
    });
  });
}

function initializePageSetup() {
  setupHeaderVisibilityObserver();
  initSplitTextAnimations();
  manageCardHoverAnimations();
  initHomeHeroAnimations();
  initViewSwitcher();
  initLabGallery();
  initializeScrollDependentAnimations();
}

async function loadNewPage(url, useTransition = false) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, "text/html");
    const update = () => updateContent(doc);

    if (useTransition && document.startViewTransition) {
      await document.startViewTransition(update).finished;
    } else {
      update();
    }
    initializePageSetup();
  } catch (error) {
    console.error("Error loading new page:", error);
  }
}

function updateContent(doc) {
  const newContent = doc.querySelector("#main-content");
  const oldContent = document.querySelector("#main-content");

  if (newContent && oldContent) {
    // Optimisation: clonage pour éviter les problèmes de référence
    oldContent.innerHTML = newContent.innerHTML;
  } else {
    // Fallback avec préservation des scripts
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    document.body.innerHTML = doc.body.innerHTML;

    // Re-ajout des scripts externes si nécessaire
    scripts.forEach((script) => {
      if (!document.querySelector(`script[src="${script.src}"]`)) {
        document.head.appendChild(script.cloneNode(true));
      }
    });
  }

  document.title = doc.title;

  // Réinitialisation optimisée
  resetPageTheme(doc);
  resetWebflow();

  // Réinitialisation des composants avec cleanup
  if (AppState.menu?.cleanup) {
    AppState.menu.cleanup();
  }
  AppState.menu = initMenu();

  const videoPlayer = initVideoPlayer();
  AppState.videoPlayer = videoPlayer;

  initScrollSmoother();

  // Scroll optimisé
  if (smoother) {
    smoother.scrollTo(0, false);
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  highlightCurrentPageDot();
}

// FONCTION RESETPAGETHEME OPTIMISÉE
function resetPageTheme(doc) {
  const newHtml = doc.querySelector("html");
  const newBody = doc.querySelector("body");
  const currentHtml = document.documentElement;
  const currentBody = document.body;

  // Optimisation: traitement par batch des changements de style
  const updates = [];

  if (newHtml && currentHtml) {
    if (newHtml.className !== currentHtml.className) {
      updates.push(() => (currentHtml.className = newHtml.className));
    }

    const newStyle = newHtml.getAttribute("style");
    const currentStyle = currentHtml.getAttribute("style");

    if (newStyle !== currentStyle) {
      updates.push(() => {
        if (newStyle) {
          currentHtml.setAttribute("style", newStyle);
        } else {
          currentHtml.removeAttribute("style");
        }
      });
    }
  }

  if (newBody && currentBody) {
    if (newBody.className !== currentBody.className) {
      updates.push(() => (currentBody.className = newBody.className));
    }

    const newBodyStyle = newBody.getAttribute("style");
    const currentBodyStyle = currentBody.getAttribute("style");

    if (newBodyStyle !== currentBodyStyle) {
      updates.push(() => {
        if (newBodyStyle) {
          currentBody.setAttribute("style", newBodyStyle);
        } else {
          currentBody.removeAttribute("style");
        }
      });
    }
  }

  // Gestion optimisée des styles CSS variables
  const newVariableStyles = Array.from(
    doc.querySelectorAll("head style")
  ).filter((style) => style.textContent.includes("--_colors"));

  const currentVariableStyles = Array.from(
    document.querySelectorAll("head style")
  ).filter((style) => style.textContent.includes("--_colors"));

  if (newVariableStyles.length > 0 || currentVariableStyles.length > 0) {
    updates.push(() => {
      // Suppression des anciens styles
      currentVariableStyles.forEach((style) => style.remove());

      // Ajout des nouveaux styles
      const fragment = document.createDocumentFragment();
      newVariableStyles.forEach((style) => {
        const newStyle = document.createElement("style");
        newStyle.textContent = style.textContent;
        fragment.appendChild(newStyle);
      });

      if (fragment.children.length > 0) {
        document.head.appendChild(fragment);
      }
    });
  }

  // Application de tous les changements en une fois
  if (updates.length > 0) {
    requestAnimationFrame(() => {
      updates.forEach((update) => update());
      // Force un seul repaint à la fin
      document.body.offsetHeight;
    });
  }
}

let AppState = {};

// FONCTION HANDLERESIZE OPTIMISÉE AVEC DEBOUNCE AMÉLIORÉ
function handleResize() {
  // Cache des dimensions pour éviter les re-calculs
  const { innerWidth, innerHeight } = window;

  // Optimisation: éviter les animations coûteuses sur resize rapide
  if (AppState.resizeAnimationFrame) {
    cancelAnimationFrame(AppState.resizeAnimationFrame);
  }

  AppState.resizeAnimationFrame = requestAnimationFrame(() => {
    try {
      manageCardHoverAnimations();

      // Fermeture optimisée du menu sur mobile
      if (innerWidth > 568 && AppState.menu?.isMenuOpen()) {
        AppState.menu.closeMenu(true);
      }

      // Refresh différé pour éviter les calculs multiples
      if (AppState.scrollRefreshTimeout) {
        clearTimeout(AppState.scrollRefreshTimeout);
      }

      AppState.scrollRefreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    } catch (error) {
      console.error("Error in resize handler:", error);
    }
  });
}

function initApp() {
  try {
    // Enregistrement des plugins avec vérification
    const plugins = [
      ScrollTrigger,
      ScrollSmoother,
      CustomEase,
      SplitText,
      DrawSVGPlugin,
      MorphSVGPlugin,
      Flip,
    ];
    const availablePlugins = plugins.filter((plugin) => plugin);

    if (availablePlugins.length > 0) {
      gsap.registerPlugin(...availablePlugins);
    }

    // Initialisation des eases
    EASES.init();

    // Initialisation des composants avec gestion d'erreurs
    AppState.menu = initMenu();
    initScrollSmoother();
    AppState.videoPlayer = initVideoPlayer();
    highlightCurrentPageDot();
    initializePageSetup();

    // Event listeners optimisés avec debounce amélioré
    const debouncedResize = debounce(handleResize, 150, false);
    window.addEventListener("resize", debouncedResize, { passive: true });

    // Navigation API avec gestion améliorée
    if (window.navigation) {
      window.navigation.addEventListener("navigate", (e) => {
        try {
          const destinationUrl = new URL(e.destination.url);
          const isSameOrigin = location.origin === destinationUrl.origin;
          const isDifferentPage = destinationUrl.href !== location.href;

          if (isSameOrigin && isDifferentPage) {
            e.intercept({
              async handler() {
                try {
                  if (AppState.menu?.isMenuOpen()) {
                    AppState.menu.closeMenu();
                    // Petit délai pour laisser l'animation se terminer
                    await new Promise((resolve) => setTimeout(resolve, 200));
                  }
                  await loadNewPage(destinationUrl.href, true);
                } catch (error) {
                  console.error("Navigation intercept error:", error);
                  // Fallback vers navigation normale
                  window.location.href = destinationUrl.href;
                }
              },
            });
          }
        } catch (error) {
          console.error("Navigation error:", error);
        }
      });
    }

    // Gestion globale des erreurs
    window.addEventListener("error", (e) => {
      console.error("Uncaught error:", e.error);
    });

    // Gestion des erreurs de promesses non catchées
    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled promise rejection:", e.reason);
    });
  } catch (error) {
    console.error("Critical error during app initialization:", error);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
