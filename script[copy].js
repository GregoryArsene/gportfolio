// GSAP & Plugins
// gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip);

// DÉFINITION DE LA CONDITION TACTILE MOBILE
const isTouchMobile =
  window.matchMedia("(max-width: 1023px)").matches &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

// Debounce optimisé avec AbortController pour le cleanup
const debounce = (func, delay, immediate = false) => {
  let timeout;
  const debounced = function executedFunction(...args) {
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    }, delay);
    if (callNow) func.apply(this, args);
  };

  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
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
    ScrollTrigger?.disable(true);
    return null;
  }

  console.log("ScrollSmoother activé.");
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
    speed: 1.2,
    normalizeScroll: true,
  });
  return smoother;
}

// Menu optimisé avec WeakMap pour éviter les fuites mémoire
const menuElementsCache = new WeakMap();
const menuCallbacks = new WeakMap();

function initMenu() {
  const menuElement = document.querySelector(".menu");
  const triggerElement = document.querySelector(".menu-trigger");
  const backgroundOverlay = document.querySelector(".menu-background-overlay");

  if (!menuElement || !triggerElement || !backgroundOverlay) {
    console.error("Élément de menu, de déclencheur ou de fond manquant.");
    return {
      openMenu: () => {},
      closeMenu: () => {},
      isMenuOpen: () => false,
      cleanup: () => {},
    };
  }

  gsap.set(menuElement, { x: "100%" });
  let isMenuOpen = false;

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

  const updateMenuState = (open) => {
    isMenuOpen = open;
    document.body.classList.toggle("menu-open", open);
    menuElement.setAttribute("aria-hidden", !open);
    triggerElement.setAttribute("aria-expanded", open);
  };

  const openTimeline = gsap
    .timeline({
      paused: true,
      defaults: { overwrite: "auto" },
      onStart: () => updateMenuState(true),
    })
    .to(menuElement, { x: "0%", duration: 0.6, ease: EASES.reveal })
    .to(backgroundOverlay, { opacity: 0.4, duration: 0.6 }, "<")
    .to(
      elements.triggerText,
      { y: "-100%", duration: 0.5, ease: EASES.menuLinkReveal },
      "<"
    )
    .fromTo(
      [
        ...elements.linkTitles,
        ...elements.linkNumbers,
        ...elements.social,
        ...elements.label,
      ],
      { y: "200%" },
      { y: "0%", duration: 0.5, stagger: 0.05, ease: EASES.menuLinkReveal },
      "<0.2"
    );

  const closeTimeline = gsap
    .timeline({
      paused: true,
      defaults: { overwrite: "auto" },
      onStart: () => updateMenuState(false),
    })
    .to(menuElement, { x: "100%", duration: 0.4, ease: EASES.reveal })
    .to(backgroundOverlay, { opacity: 0, duration: 0.4 }, "<")
    .to(
      elements.triggerText,
      { y: "0%", duration: 0.3, ease: EASES.menuLinkReveal },
      "<"
    );

  const openMenu = () => {
    if (isMenuOpen) return;
    closeTimeline.pause();
    openTimeline.restart();
  };

  const closeMenu = (instant = false) => {
    if (!isMenuOpen) return;
    openTimeline.pause();

    if (instant) {
      // Fermeture instantanée sans animation via gsap.set()
      updateMenuState(false);
      gsap.set(menuElement, { x: "100%" });
      gsap.set(backgroundOverlay, { opacity: 0 });
      gsap.set(elements.triggerText, { y: "0%" });
      closeTimeline.pause(0); // Réinitialise la timeline au cas où
    } else {
      // Fermeture avec animation (comportement normal)
      closeTimeline.restart();
    }
  };

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

  const callbacks = { handleClick, handleKeydown };
  menuCallbacks.set(menuElement, callbacks);

  document.addEventListener("click", handleClick, { passive: true });
  document.addEventListener("keydown", handleKeydown, { passive: true });

  const cleanup = () => {
    const storedCallbacks = menuCallbacks.get(menuElement);
    if (storedCallbacks) {
      document.removeEventListener("click", storedCallbacks.handleClick);
      document.removeEventListener("keydown", storedCallbacks.handleKeydown);
      menuCallbacks.delete(menuElement);
    }
    openTimeline.kill();
    closeTimeline.kill();
    menuElementsCache.delete(menuElement);
  };

  return { openMenu, closeMenu, isMenuOpen: () => isMenuOpen, cleanup };
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

  if (!elements.video || !elements.morphPath1 || !elements.morphPath2) {
    return {
      play: () => {},
      pause: () => {},
      toggle: () => {},
      isPlaying: () => false,
      cleanup: () => {},
    };
  }

  const state = {
    isPlaying: false,
    hideTimeout: null,
    isHovering: false,
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const updateVisibility = (elementsArray, opacity, duration = 0.5) => {
    const validElements = elementsArray.filter(Boolean);
    if (validElements.length === 0) return;
    gsap.to(validElements, { duration, opacity, ease: "power2.out" });
  };

  const showHideElements = (show) => {
    const textElements = [elements.videoTitle, elements.videoDuration];
    const controlElements = [
      elements.videoIdTop,
      elements.videoIdBtm,
      elements.videoControls,
    ];
    if (show || !state.isHovering) {
      updateVisibility(textElements, show ? 1 : 0);
    }
    if (show || (!state.isHovering && state.isPlaying)) {
      updateVisibility(controlElements, show ? 1 : 0);
    }
  };

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

  const updatePlayerState = (playing) => {
    const paths = SVG_PATHS[playing ? "pause" : "play"];
    const duration = playing ? 0.5 : 0.5;
    gsap.to(elements.morphPath1, {
      duration,
      attr: { points: paths.path1 },
      ease: "power2.inOut",
    });
    gsap.to(elements.morphPath2, {
      duration: playing ? 0.5 : 0.3,
      attr: { points: paths.path2 },
      ease: "power2.inOut",
    });
    state.isPlaying = playing;
    if (elements.videoControlsText) {
      elements.videoControlsText.textContent = playing ? "PAUSE" : "PLAY";
    }
    if (elements.videoIndicator) {
      elements.videoIndicator.style.borderBottomColor = playing ? "red" : "";
    }
    if (state.hideTimeout) {
      clearTimeout(state.hideTimeout);
      state.hideTimeout = null;
    }
    if (playing) {
      state.hideTimeout = setTimeout(() => showHideElements(false), 3000);
    } else {
      showHideElements(true);
    }
  };

  const togglePlayback = async () => {
    try {
      if (state.isPlaying) {
        elements.video.pause();
      } else {
        await elements.video.play();
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de la vidéo:", error);
      updatePlayerState(false);
    }
  };

  const handlers = {
    click: () => togglePlayback(),
    mouseenter: () => {
      state.isHovering = true;
      showHideElements(true);
    },
    mouseleave: () => {
      state.isHovering = false;
      if (state.isPlaying) {
        if (state.hideTimeout) clearTimeout(state.hideTimeout);
        state.hideTimeout = setTimeout(() => showHideElements(false), 3000);
      }
    },
    play: () => {
      if (!state.isPlaying) updatePlayerState(true);
    },
    pause: () => {
      if (state.isPlaying) updatePlayerState(false);
    },
    timeupdate: () => {
      if (elements.video && elements.videoDuration) {
        const remainingTime =
          elements.video.duration - elements.video.currentTime;
        elements.videoDuration.textContent = formatTime(remainingTime);
      }
    },
    loadedmetadata: () => {
      if (elements.videoDuration && elements.video.duration) {
        elements.videoDuration.textContent = formatTime(
          elements.video.duration
        );
      }
    },
  };

  elements.morphPath1.setAttribute("points", SVG_PATHS.play.path1);
  elements.morphPath2.setAttribute("points", SVG_PATHS.play.path2);
  if (elements.videoControlsText) {
    elements.videoControlsText.textContent = "PLAY";
  }

  Object.entries(handlers).forEach(([event, handler]) => {
    elements.video.addEventListener(event, handler, { passive: true });
  });

  if (elements.video.duration) {
    handlers.loadedmetadata();
  }

  const cleanup = () => {
    if (state.hideTimeout) clearTimeout(state.hideTimeout);
    Object.entries(handlers).forEach(([event, handler]) => {
      elements.video.removeEventListener(event, handler);
    });
  };

  return {
    play: () => updatePlayerState(true),
    pause: () => updatePlayerState(false),
    toggle: togglePlayback,
    isPlaying: () => state.isPlaying,
    cleanup,
  };
}

function highlightCurrentPageDot() {
  const pageName =
    window.location.pathname.split("/").pop().replace(".html", "") ||
    "home_page_no_dot";
  const dots = document.querySelectorAll(".header-item_dot");
  dots.forEach((dot) => dot.classList.remove("active-dot"));

  if (["projects", "about", "lab"].includes(pageName)) {
    const targetDot = document.getElementById(`${pageName}-dot`);
    targetDot?.classList.add("active-dot");
  }
}

function initHeaderAnimation() {
  const logo = document.querySelector(".header-logo");
  const navItems = gsap.utils.toArray(".header_list-item");
  if (!logo && navItems.length === 0) return;

  gsap.set([logo, ...navItems], { clearProps: "all" });
  const timeline = gsap.timeline({
    defaults: { overwrite: "auto", ease: EASES.reveal },
  });

  if (logo) {
    gsap.set(logo, { y: "300%" });
    timeline.to(logo, { y: "0%", duration: 0.5 });
  }

  if (navItems.length > 0) {
    gsap.set(navItems, { y: "200%" });
    timeline.to(
      navItems,
      { y: "0%", duration: 0.5, stagger: 0.1 },
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
    const entry = entries[0];
    const isVisible = entry.contentRect.height > 0;
    if (isVisible && !isAnimated) {
      isAnimated = true;
      requestAnimationFrame(() => initHeaderAnimation());
    } else if (!isVisible && isAnimated) {
      isAnimated = false;
      const elements = [
        document.querySelector(".header-logo"),
        ...gsap.utils.toArray(".header_list-item"),
      ];
      gsap.set(elements, { clearProps: "all" });
    }
  };

  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(headerNav);

  return () => {
    resizeObserver?.disconnect();
  };
}

// Assurez-vous que EASES.reveal est bien défini quelque part dans votre code
// si vous continuez à l'utiliser. Sinon, remplacez-le par une ease standard
// comme "power2.out".

// Assurez-vous que EASES.reveal est bien défini quelque part dans votre code.
// Sinon, remplacez-le par une ease standard comme "power2.out".

function initHomeHeroAnimations() {
  const mainCta = document.querySelector(".main-cta");

  // Sécurité : on s'assure que l'élément existe avant de continuer
  if (!mainCta) {
    return;
  }

  // Crée un objet pour tester la media query des écrans larges
  const mediaQuery = window.matchMedia("(min-width: 1025px)");

  // On vérifie si la condition est remplie AU MOMENT DU CHARGEMENT
  if (mediaQuery.matches) {
    // Si l'écran est plus large que 1024px, on lance l'animation
    gsap.to(mainCta, {
      y: "0%", // La destination finale
      duration: 0.75, // La durée de l'animation
      delay: 0.5, // Le délai avant le début de l'animation
      ease: EASES.reveal, // Votre "ease" personnalisée
    });
  }
  // Si la condition n'est pas remplie (écran <= 1024px), on ne fait RIEN.
  // Le CSS s'est déjà chargé de placer le bouton à y: 0%.
}

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

// Assurez-vous que EASES.reveal est bien défini quelque part dans votre code
// si vous continuez à l'utiliser. Sinon, remplacez-le par une ease standard
// comme "power2.out".

function initLabGallery() {
  const galleryContainer = document.querySelector(".lab-gallery_content");
  if (!galleryContainer) return;

  const gridItems = Array.from(
    galleryContainer.querySelectorAll(".lab-grid_item")
  );
  if (gridItems.length === 0) return;

  const buildColumns = () => {
    const computedStyles = getComputedStyle(galleryContainer);
    const numColumns = computedStyles
      .getPropertyValue("grid-template-columns")
      .split(" ")
      .filter((val) => val && val !== "0px").length;
    if (numColumns === 0) return;

    const { rowGap, columnGap } = computedStyles;
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
      column.style.cssText = `display: flex; flex-direction: column; gap: ${rowGap}`;
      items.forEach((item) => column.appendChild(item));
      fragment.appendChild(column);
      const lag = 0.05 * Math.abs(index - centerIndex);
      smootherEffects.push({ element: column, lag });
    });

    galleryContainer.innerHTML = "";
    galleryContainer.appendChild(fragment);
    galleryContainer.style.cssText = `display: flex; gap: ${columnGap}`;

    if (smoother) {
      smootherEffects.forEach(({ element, lag }) => {
        smoother.effects(element, { speed: 1, lag });
      });
    }
    galleryContainer.classList.add("gallery-is-ready");
  };

  document.fonts.ready.then(() => {
    setTimeout(buildColumns, 50);
  });
}

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
  initLabGallery();
  initHomeHeroAnimations();
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
    oldContent.innerHTML = newContent.innerHTML;
  } else {
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    document.body.innerHTML = doc.body.innerHTML;
    scripts.forEach((script) => {
      if (!document.querySelector(`script[src="${script.src}"]`)) {
        document.head.appendChild(script.cloneNode(true));
      }
    });
  }

  document.title = doc.title;
  resetWebflow();

  if (AppState.menu?.cleanup) {
    AppState.menu.cleanup();
  }
  AppState.menu = initMenu();

  AppState.videoPlayer = initVideoPlayer();
  initScrollSmoother();

  if (smoother) {
    smoother.scrollTo(0, false);
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  highlightCurrentPageDot();
}

let AppState = {};

function handleResize() {
  const { innerWidth } = window;
  if (AppState.resizeAnimationFrame) {
    cancelAnimationFrame(AppState.resizeAnimationFrame);
  }

  AppState.resizeAnimationFrame = requestAnimationFrame(() => {
    try {
      manageCardHoverAnimations();
      if (innerWidth > 568 && AppState.menu?.isMenuOpen()) {
        AppState.menu.closeMenu(true);
      }
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

    EASES.init();
    AppState.menu = initMenu();
    initScrollSmoother();
    AppState.videoPlayer = initVideoPlayer();
    highlightCurrentPageDot();
    initializePageSetup();

    const debouncedResize = debounce(handleResize, 150, false);
    window.addEventListener("resize", debouncedResize, { passive: true });

    // GESTION DE LA RESTAURATION DEPUIS LE CACHE (BOUTON PRÉCÉDENT)
    window.addEventListener("pageshow", (event) => {
      // event.persisted est true si la page est restaurée depuis le back-forward cache (bfcache).
      if (event.persisted && AppState.menu?.isMenuOpen()) {
        console.log(
          "Page restaurée depuis le cache, fermeture instantanée du menu."
        );
        // On appelle closeMenu avec le paramètre 'instant' à true.
        AppState.menu.closeMenu(true);
      }
    });

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
                    await new Promise((resolve) => setTimeout(resolve, 200));
                  }
                  await loadNewPage(destinationUrl.href, true);
                } catch (error) {
                  console.error("Navigation intercept error:", error);
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

    window.addEventListener("error", (e) => {
      console.error("Uncaught error:", e.error);
    });
    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled promise rejection:", e.reason);
    });
  } catch (error) {
    console.error("Critical error during app initialization:", error);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
