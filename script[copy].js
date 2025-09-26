// CODE COMPLET AVEC SNAP SUR LES ID commençant par "ideas-"

const isTouchMobile =
  window.matchMedia("(max-width: 1023px)").matches &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

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
    ScrollTrigger?.disable(true);
    return null;
  }

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

const menuElementsCache = new WeakMap();
const menuCallbacks = new WeakMap();

function initMenu() {
  const menuElement = document.querySelector(".menu");
  const triggerElement = document.querySelector(".menu-trigger");
  const backgroundOverlay = document.querySelector(".menu-background-overlay");

  if (!menuElement || !triggerElement || !backgroundOverlay) {
    return {
      openMenu: () => {},
      closeMenu: () => {},
      isMenuOpen: () => false,
      cleanup: () => {},
    };
  }

  let isMenuOpen = false;

  let elements = menuElementsCache.get(menuElement);
  if (!elements) {
    elements = {
      triggerText: document.querySelectorAll(".menu-trigger_text"),
      linkTitles: document.querySelectorAll(".primary-nav_title"),
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
      onStart: () => {
        updateMenuState(true);
        gsap.set(menuElement, { pointerEvents: "auto" });
      },
    })
    .to(menuElement, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.6,
      ease: EASES.reveal,
    })
    .to(backgroundOverlay, { opacity: 0.4, duration: 0.6 }, "<")
    .to(
      elements.triggerText,
      { y: "-200%", duration: 0.5, ease: EASES.menuLinkReveal },
      "<"
    )
    .fromTo(
      elements.linkTitles,
      { y: "200%" },
      { y: "0%", duration: 0.5, stagger: 0.05, ease: EASES.menuLinkReveal },
      "<0.2"
    );

  const closeTimeline = gsap
    .timeline({
      paused: true,
      defaults: { overwrite: "auto" },
      onComplete: () => {
        updateMenuState(false);
        gsap.set(menuElement, { pointerEvents: "none" });
      },
    })
    .to(menuElement, {
      clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      duration: 0.4,
      ease: EASES.reveal,
    })
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
      updateMenuState(false);
      gsap.set(menuElement, {
        clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        pointerEvents: "none",
      });
      gsap.set(backgroundOverlay, { opacity: 0 });
      gsap.set(elements.triggerText, { y: "0%" });
      closeTimeline.pause(0);
    } else {
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
  } catch (error) {}
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

function initHeaderAnimation() {
  const logo = document.querySelector(".header-logo");
  const availability = document.querySelector(".header-availability");
  const navItems = gsap.utils.toArray(".header_list-item");

  const allElements = [logo, availability, ...navItems].filter(Boolean);

  if (allElements.length === 0) return;

  gsap.set(allElements, { clearProps: "all" });

  const timeline = gsap.timeline({
    defaults: { overwrite: "auto", ease: EASES.reveal },
  });

  if (logo) {
    gsap.set(logo, { y: "300%" });
    timeline.to(logo, { y: "0%", duration: 0.5 });
  }

  if (availability) {
    gsap.set(availability, { y: "200%" });
    timeline.to(availability, { y: "0%", duration: 0.5 }, logo ? "<0.2" : 0);
  }

  if (navItems.length > 0) {
    gsap.set(navItems, { y: "200%" });
    timeline.to(
      navItems,
      { y: "0%", duration: 0.5, stagger: 0.1 },
      availability ? "<0.1" : logo ? "<0.2" : 0
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

function initHomeHeroAnimations() {
  const mainCta = document.querySelector(".main-cta");
  if (!mainCta) {
    return;
  }
  const mediaQuery = window.matchMedia("(min-width: 1025px)");
  if (mediaQuery.matches) {
    gsap.to(mainCta, {
      y: "0%",
      duration: 0.75,
      delay: 0.5,
      ease: EASES.reveal,
    });
  }
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
                } catch (e) {}
            }),
            ScrollTrigger.refresh(),
            e();
        }, 50);
    });
  });
}

function initializeScrollDependentAnimations() {
  if (isTouchMobile) {
    gsap.set('[data-anim-stroke="true"]', { "--stroke-width": "100%" });
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
}

function updateActiveNavLink() {
  const currentPathname = window.location.pathname;
  const navLinks = document.querySelectorAll(".header_item-link");

  navLinks.forEach((link) => {
    const linkPathname = new URL(link.href).pathname;
    link.classList.remove("is-current");
    if (linkPathname === currentPathname) {
      link.classList.add("is-current");
    }
  });
}

function initializePageSetup() {
  setupHeaderVisibilityObserver();
  initSplitTextAnimations();
  initHomeHeroAnimations();
  initializeScrollDependentAnimations();

  // --- DÉBUT DE LA LOGIQUE POUR L'ANIMATION SUR "COUP DE SCROLL" ---

  if (!isTouchMobile) {
    const leftBracket = document.querySelector(".ideas-bracket.is--left");
    const rightBracket = document.querySelector(".ideas-bracket.is--right");

    if (leftBracket && rightBracket) {
      let isAnimating = false;

      const bracketTimeline = gsap.timeline({
        paused: true,
        onComplete: () => {
          isAnimating = false;
        },
      });

      const duration = 0.4;
      const ease = "power4.inOut";

      bracketTimeline
        .to(leftBracket, { xPercent: 100, duration, ease })
        .to(rightBracket, { xPercent: -100, duration, ease }, "<")
        .to(leftBracket, { xPercent: 0, duration, ease })
        .to(rightBracket, { xPercent: 0, duration, ease }, "<");

      Observer.create({
        target: window,
        type: "wheel,touch",
        onWheel: () => {
          if (!isAnimating) {
            isAnimating = true;
            bracketTimeline.restart();
          }
        },
      });
    }
  }
  // --- FIN DE LA LOGIQUE ---
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
  } catch (error) {}
}

function updateContent(doc) {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

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
  updateActiveNavLink();
}

let AppState = {};

function handleResize() {
  const { innerWidth } = window;
  if (AppState.resizeAnimationFrame) {
    cancelAnimationFrame(AppState.resizeAnimationFrame);
  }

  AppState.resizeAnimationFrame = requestAnimationFrame(() => {
    try {
      if (innerWidth > 568 && AppState.menu?.isMenuOpen()) {
        AppState.menu.closeMenu(true);
      }
      if (AppState.scrollRefreshTimeout) {
        clearTimeout(AppState.scrollRefreshTimeout);
      }
      AppState.scrollRefreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    } catch (error) {}
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
      Observer, // PLUGIN AJOUTÉ
    ];
    const availablePlugins = plugins.filter((plugin) => plugin);
    if (availablePlugins.length > 0) {
      gsap.registerPlugin(...availablePlugins);
    }

    EASES.init();
    AppState.menu = initMenu();
    initScrollSmoother();
    AppState.videoPlayer = initVideoPlayer();
    updateActiveNavLink();
    initializePageSetup();

    const debouncedResize = debounce(handleResize, 150, false);
    window.addEventListener("resize", debouncedResize, { passive: true });

    window.addEventListener("pageshow", (event) => {
      if (event.persisted && AppState.menu?.isMenuOpen()) {
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
                  window.location.href = destinationUrl.href;
                }
              },
            });
          }
        } catch (error) {}
      });
    }

    window.addEventListener("error", (e) => {});
    window.addEventListener("unhandledrejection", (e) => {});
  } catch (error) {}
}

document.addEventListener("DOMContentLoaded", initApp);
