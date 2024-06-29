gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", function () {
  // Initialisation de Lenis Scroll
  const lenis = new Lenis({
    lerp: 0.1,
    orientation: "vertical",
    wheelMultiplier: 1.2,
  });

  lenis.on("scroll", (e) => {
    console.log(e);
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Initialisation des éléments et variables
  const menu = document.querySelector(".menu");
  const headerElement = document.querySelector(".header");
  const menuTrigger = document.querySelector(".menu-trigger");
  const navLogoContainer = document.querySelector(".nav-logo-container");

  let isMenuOpen = false;
  let isAnimating = false;

  // Fonction pour ouvrir le menu
  function openMenu() {
    if (!isMenuOpen && !isAnimating) {
      isAnimating = true;
      headerElement.style.mixBlendMode = "normal";

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          isMenuOpen = true;
        }
      });

      tl.to(".menu-trigger-text", {
        y: "-100%",
        duration: 0.5,
        ease: "power1.inOut",
      })
        .to(menu, {
          y: "0%",
          duration: 1,
          ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
          display: "flex",
        }, 0)
        .from(".menu-link-title .line", {
          y: "200%",
          duration: 0.8,
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
          stagger: 0.1,
        }, 0.5)
        .from(".menu-img", {
          scale: 1.5,
          duration: 1.2,
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
        }, 0.4)
        .from(".menu-social-link-title .word", {
          y: "200%",
          opacity: 1,
          duration: 1,
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
          stagger: 0.1,
        }, 0.6);

      // SplitType pour le titre du menu et les liens sociaux
      new SplitType(".menu-link-title", { types: "lines, words, chars" });
      new SplitType(".menu-social-link-title", {
        types: "lines, words, chars",
        tagName: "span",
      });
    }
  }

  // Fonction pour fermer le menu
  function closeMenu() {
    if (isMenuOpen && !isAnimating) {
      isAnimating = true;

      const tl = gsap.timeline({
        onComplete: () => {
          headerElement.style.mixBlendMode = "";
          isAnimating = false;
          isMenuOpen = false;
        }
      });

      tl.to(menu, {
        y: "-100%",
        duration: 1,
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
        display: "none",
      })
        .to(".menu-trigger-text", {
          y: "0%",
          duration: 0.4,
          ease: "power1.inOut",
        }, 0.3);
    }
  }

  // Gestion du survol des liens du menu
  const menuLinks = document.querySelectorAll(".menu-link");
  menuLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      gsap.to(menuLinks, {
        opacity: (i, el) => (el === link ? 1 : 0.3),
        duration: 0.3
      });
    });
    link.addEventListener("mouseleave", () => {
      gsap.to(menuLinks, { opacity: 1, duration: 0.3 });
    });
  });

  // Écouteurs d'événements pour le menu
  menuTrigger.addEventListener("click", () => isMenuOpen ? closeMenu() : openMenu());
  document.querySelectorAll(".menu a:not(.nav-logo-container a)").forEach(el => el.addEventListener("click", closeMenu));
  navLogoContainer.addEventListener("click", () => { if (isMenuOpen) closeMenu(); });

  // Initialisation des animations
  initLineLeftText();
  initRightText();
  initLinesText();
  initMenuLinkOpacity();
  initProjectItem();
  initProjectPageHero();
});

// Variables globales
let animationPlayed = false;
let splitElements = [];

// Fonctions d'initialisation des animations
function initLineLeftText() {
  const elements = document.querySelectorAll("[line-left]");
  elements.forEach((element) => {
    if (element._splitType) {
      SplitType.revert(element);
    }
    const split = new SplitType(element, { types: "lines" });
    splitElements.push(split);

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
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
          delay: 0.5 + index * 0.1,
        }
      );
    });
  });
}

function initRightText() {
  gsap.utils.toArray("[line-right]").forEach(element => {
    gsap.fromTo(
      element,
      { y: "100%" },
      {
        y: "0%",
        duration: 0.8,
        ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
        delay: 0.7,
      }
    );
  });
}

function initLinesText() {
  const elements = document.querySelectorAll("[lines]");
  elements.forEach((element) => {
    if (element._splitType) {
      SplitType.revert(element);
    }
    const split = new SplitType(element, { types: "lines" });
    splitElements.push(split);

    split.lines.forEach((line, index) => {
      const lineWrapper = document.createElement("div");
      lineWrapper.style.overflow = "hidden";
      line.parentNode.insertBefore(lineWrapper, line);
      lineWrapper.appendChild(line);

      gsap.fromTo(
        line,
        { y: "100%" },
        {
          y: "0%",
          duration: 0.8,
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
          delay: 0.1 + index * 0.06,
          scrollTrigger: {
            trigger: lineWrapper,
            start: "top 150%",
          },
        }
      );
    });
  });
}

// Fonction pour mettre à jour les éléments SplitType
function updateSplitText() {
  splitElements.forEach(split => split.split());
}

// Écouteur d'événement pour le redimensionnement avec debounce
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

window.addEventListener("resize", debounce(updateSplitText, 250));

// Grayscale Project Item
function initMenuLinkOpacity() {
  const projectItems = document.querySelectorAll(".home-project-item");
  const tl = gsap.timeline({ paused: true });

  tl.to(projectItems, {
    filter: "grayscale(100%)",
    duration: 0.3,
    ease: "power1.out",
  });

  projectItems.forEach(item => {
    item.addEventListener("mouseenter", () => tl.play());
    item.addEventListener("mouseleave", () => tl.reverse());
  });
}

// Home - Project Item Image Animation
function initProjectItem() {
  gsap.utils.toArray(".project-img").forEach(img => {
    gsap.from(img, {
      y: "-29%",
      scrollTrigger: {
        trigger: img,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.1,
        ease: "none",
      },
    });
  });
}

function initProjectPageHero() {
  const projectHeroImg = document.querySelector(".project-hero-img");
  if (projectHeroImg) {
    const tl = gsap.timeline();
    tl.to(projectHeroImg, {
      duration: 1.2,
      scale: 1,
      delay: 0.4,
      ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
    });

    gsap.to(projectHeroImg, {
      y: 0,
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

// Page Transition Animations
function pageEnterAnimation() {
  return new Promise(resolve => {
    const tl = gsap.timeline({ onComplete: resolve });
    tl.set(".page-transition", { display: "block" })
      .to(".page-transition", {
        duration: 1,
        y: "0%",
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
      })
      .fromTo(
        ".page-content",
        { y: "0vh" },
        {
          duration: 1,
          y: "-100vh",
          ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
        },
        "-=1"
      )
      .fromTo(
        ".opacity-transition",
        { opacity: 0, display: "block" },
        {
          opacity: 0.8,
          duration: 1,
          ease: "linear",
          display: "none",
        },
        "-=1"
      );
  });
}

function pageExitAnimation() {
  return new Promise(resolve => {
    const tl = gsap.timeline({ onComplete: resolve });
    tl.set(".page-transition", { y: "0%" })
      .to(".page-transition", {
        duration: 1,
        y: "-100%",
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
      })
      .fromTo(
        ".page-content",
        { y: "50vh" },
        {
          duration: 1,
          y: "0vh",
          ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
        },
        "-=1"
      )
      .to(
        ".opacity-transition",
        {
          duration: 1,
          opacity: 0,
          ease: "linear",
        },
        "-=1"
      )
      .set(".page-transition", { display: "none", y: "100%" });
  });
}

function updateCurrentClass() {
  document.querySelectorAll('.w-current').forEach(el => el.classList.remove('w--current'));
  document.querySelectorAll('.nav a').forEach(el => {
    if (el.getAttribute('href') === window.location.pathname) {
      el.classList.add('w--current');
    }
  });
}

function resetWebflow(data) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data.next.html, "text/html");
  const webflowPageId = dom.querySelector('html').getAttribute('data-wf-page');
  if (window.Webflow) {
    document.documentElement.setAttribute('data-wf-page', webflowPageId);
    window.Webflow.destroy();
    window.Webflow.ready();
    window.Webflow.require('ix2').init();
  }
}

barba.init({
  transitions: [
    {
      preventRunning: true,
      async leave(data) {
        try {
          await pageEnterAnimation();
        } catch (error) {
          console.error('Error during page enter animation:', error);
        }
      },
      enter(data) {
        try {
          updateCurrentClass();
          data.next.container.classList.add("fixed");
          resetWebflow(data);
          gsap.to(data.next.container, {
            onComplete: () => {
              data.next.container.classList.remove("fixed");
              window.scrollTo(0, 0);
              pageExitAnimation();
              initLineLeftText();
              initRightText();
              initLinesText();
              initMenuLinkOpacity();
              initProjectItem();
              initProjectPageHero();
              data.next.container.querySelectorAll("video").forEach(video => video.play());
            },
          });
        } catch (error) {
          console.error('Error during page transition:', error);
        }
      },
    },
  ],
});

// Écoutez l'événement 'barbaAfterEnter'
barba.hooks.afterEnter(() => {
  if (!animationPlayed) {
    initLineLeftText();
    initRightText();
    initLinesText();
    animationPlayed = true;
  }
});