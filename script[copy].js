const customEaseInOut = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
const menuLinkRevealEase = CustomEase.create(
  "custom",
  "M0,0 C0.25,0.1 0.25,1 1,1"
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

  document.addEventListener("click", handleMenuInteractions);

  return { openMenu, closeMenu };
}

function initBarba(lenis, closeMenu) {
  barba.hooks.before((data) => {
    lenis.stop();
    saveScrollPosition(data.current.url.path);
  });

  barba.hooks.after((data) => {
    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";
    closeMenu();
    lenis.start();

    if (data.trigger === "back" || data.trigger === "forward") {
      restoreScrollPosition(data.next.url.path);
    } else {
      window.scrollTo(0, 0);
    }

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

  if (!indexBtn || !gridBtn || !indexContent || !projectsContent) {
    console.warn(
      "Les éléments nécessaires pour initProjectDisplay sont absents de cette page."
    );
    return;
  }

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

  if (!gridButton || !indexButton) {
    console.warn(
      "Les boutons nécessaires pour initDisplayHover sont absents de cette page."
    );
    return;
  }

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

window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
});

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  const video = document.getElementById("projectVideo");
  if (video) {
    requestAnimationFrame(() => {
      video.load();
      video.play().catch(console.error);
    });
  }

  const lenis = initLenis();
  const { openMenu, closeMenu } = initMenu(lenis);

  requestAnimationFrame(() => {
    initBarba(lenis, closeMenu);
    initLinesAnimations();
    initMediaControls();
    initProjectPageHero();

    if (document.querySelector(".projects_display_btn.is--index")) {
      initProjectDisplay();
    }
    if (document.querySelector(".projects_display_btn.is--grid")) {
      initDisplayHover();
    }
    projectIndex();
  });
});
