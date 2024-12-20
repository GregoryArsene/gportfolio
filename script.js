// Optimized JavaScript with performance and readability improvements

// Custom Easing Constants (Memoized)
const customEaseInOut = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
const menuLinkRevealEase = CustomEase.create(
  "custom",
  "M0,0 C0.25,0.1 0.25,1 1,1"
);

// --- Preloader Integration Start ---
// Function to check if the Webflow CSS is loaded
function isWebflowCSSLoaded() {
  // Replace '.une-classe-webflow' with a class or selector
  // that is *only* defined in your main Webflow CSS file.
  return !!document.querySelector(".page-code");
}

// Preloader logic
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
// --- Preloader Integration End ---

// Lenis Initialization with Performance Optimizations
function initLenis() {
  const lenis = new Lenis({
    lerp: 0.09,
    orientation: "vertical",
    wheelMultiplier: 1.7,
    smoothTouch: true, // Added smooth touch scrolling
    smoothWheel: true, // Ensure smooth wheel scrolling
  });

  // More efficient animation frame handling
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

// Enhanced Menu Initialization with Better Performance and Accessibility
function initMenu(lenis) {
  const menu = document.querySelector(".menu");
  const menuTrigger = document.querySelector(".menu_trigger");
  const menuElements = {
    triggerText: document.querySelectorAll(".menu_trigger_text"),
    linkTitles: document.querySelectorAll(".primary_nav_title"),
    social: document.querySelectorAll(".secondary_nav_title"),
  };

  let isMenuOpen = false;
  let menuAnimation = null;

  function animateMenu(open) {
    // Cancel any ongoing animation
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
      lenis.stop();
      animateMenu(true);
    }
  }

  function closeMenu() {
    if (isMenuOpen) {
      isMenuOpen = false;
      return animateMenu(false).then(() => {
        document.body.classList.remove("menu-open");
        lenis.start();
      });
    }
    return Promise.resolve();
  }

  // Improved event handling with event delegation and optimization
  const handleMenuInteractions = (e) => {
    // Menu trigger click
    if (menuTrigger.contains(e.target)) {
      e.stopPropagation();
      toggleMenu();
      return;
    }

    // Close menu when clicking outside
    if (isMenuOpen && !menu.contains(e.target)) {
      closeMenu();
      return;
    }

    // Handle menu link clicks
    if (e.target.tagName === "A" && menu.contains(e.target)) {
      const link = e.target;
      const href = link.getAttribute("href");

      if (href) {
        if (!link.classList.contains("secondary_nav_link")) {
          e.preventDefault();
          closeMenu();
          setTimeout(() => {
            barba.go(href);
          }, 300);
        }
      }
    }
  };

  // Use single event listener with delegation
  document.addEventListener("click", handleMenuInteractions);

  return { openMenu, closeMenu };
}

// Barba.js Initialization with Enhanced Transitions
function initBarba(lenis, closeMenu) {
  // Performance optimization: Minimize hooks and transitions
  barba.hooks.before((data) => {
    lenis.stop();
    saveScrollPosition(data.current.url.path);
  });

  barba.hooks.after((data) => {
    closeMenu();
    lenis.start();

    // Intelligent scroll restoration
    if (data.trigger === "back" || data.trigger === "forward") {
      restoreScrollPosition(data.next.url.path);
    } else {
      window.scrollTo(0, 0);
    }

    // Batched page initialization
    requestAnimationFrame(() => {
      const pageInitFunctions = [
        initMediaControls,
        initProjectPageHero,
        initProjectDisplay,
        initDisplayHover,
        initLinesAnimations,
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

  // More robust Barba initialization
  barba.init({
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
            },
          });
        },
      },
    ],
    prefetch: true,
    debug: false, // Set to true during development
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
  const video = document.getElementById("projectVideo");
  if (video) {
    video.load();
    video.play();
  }
});

window.addEventListener("popstate", () => {
  const navigationType = performance.getEntriesByType("navigation")[0].type;
  barba.go(window.location.href, { trigger: navigationType });
  initLinesAnimations();
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

  initSplitText("[line-text-2]", {
    fromY: "300%",
    duration: 0.8,
    baseDelay: 0.5,
    staggerDelay: 0.1,
  });
}

function initProjectDisplay() {
  const indexBtn = document.querySelector(".projects_display_btn.is--index");
  const gridBtn = document.querySelector(".projects_display_btn.is--grid");
  const indexContent = document.querySelector(".index");
  const projectsContent = document.querySelector(".projects");

  indexBtn.addEventListener("click", () => {
    indexContent.style.display = "block";
    requestAnimationFrame(() => {
      indexContent.classList.add("active");
      indexContent.classList.remove("inactive");
    });

    projectsContent.classList.add("inactive");
    projectsContent.classList.remove("active");
    setTimeout(() => {
      if (projectsContent.classList.contains("inactive")) {
        projectsContent.style.display = "none";
      }
    }, 250);
  });

  gridBtn.addEventListener("click", () => {
    projectsContent.style.display = "block";
    requestAnimationFrame(() => {
      projectsContent.classList.add("active");
      projectsContent.classList.remove("inactive");
    });

    indexContent.classList.add("inactive");
    indexContent.classList.remove("active");
    setTimeout(() => {
      if (indexContent.classList.contains("inactive")) {
        indexContent.style.display = "none";
      }
    }, 250);
  });
}

function initDisplayHover() {
  const gridButton = document.querySelector(".projects_display_btn.is--grid");
  const indexButton = document.querySelector(".projects_display_btn.is--index");

  function toggleSecondaryColor(clickedButton, otherButton) {
    clickedButton.classList.remove("secondary");
    otherButton.classList.add("secondary");
  }

  gridButton.addEventListener("click", () =>
    toggleSecondaryColor(gridButton, indexButton)
  );
  indexButton.addEventListener("click", () =>
    toggleSecondaryColor(indexButton, gridButton)
  );
}

function projectIndex() {
  const projectItems = document.querySelectorAll(".projects_index_item");

  projectItems.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      document.querySelector(`#index-img-${index + 1}`).style.opacity = "1";
    });

    item.addEventListener("mouseleave", () => {
      document.querySelector(`#index-img-${index + 1}`).style.opacity = "0";
    });
  });
}

// Project page hero animation
function initProjectPageHero() {
  const projectHeroImg = document.querySelector(".project_hero_img");
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
  const video = document.getElementById("projectVideo");
  const playPauseBtn = document.querySelector(".video_controls");
  const timeRemaining = document.querySelector(".video_time");

  if (video && playPauseBtn && timeRemaining) {
    gsap.set([playPauseBtn, timeRemaining], { opacity: 1 });

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

// Enhanced Error Handling for Global Events
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
});

// Performance-optimized DOMContentLoaded Event
document.addEventListener("DOMContentLoaded", () => {
  // --- Preloader Initialization ---
  initPreloader();

  // Lazy load video if exists
  const video = document.getElementById("projectVideo");
  if (video) {
    // Use requestAnimationFrame for smoother loading
    requestAnimationFrame(() => {
      video.load();
      video.play().catch(console.error);
    });
  }

  // Initialize core functionalities
  const lenis = initLenis();
  const { openMenu, closeMenu } = initMenu(lenis);

  // Batch initialization to reduce layout thrashing
  requestAnimationFrame(() => {
    initBarba(lenis, closeMenu);
    initLinesAnimations();
    initMediaControls();
    initProjectPageHero();
    initProjectDisplay();
    initDisplayHover();
    projectIndex();
  });
});
