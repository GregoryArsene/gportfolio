// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  const lenis = initLenis();
  const { openMenu, closeMenu } = initMenu(lenis);
  initBarba(lenis, closeMenu);
  initLinesAnimations();
  initLogoReveal();
});

// Custom Ease Definitions
const easeInOutCubic = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
const easeOutExpo = CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");
const easeInOutExpo = CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1");

// Lenis initialization
function initLenis() {
  const lenis = new Lenis({
    lerp: 0.09,
    orientation: "vertical",
    wheelMultiplier: 1.6,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return lenis;
}

// Menu initialization
function initMenu(lenis) {
  const menu = document.querySelector(".menu");
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuElements = {
    triggerText: document.querySelectorAll(".menu-trigger-text"),
    linkTitles: document.querySelectorAll(".menu-link-title"),
    social: document.querySelectorAll("[menu-social]"),
  };

  let isMenuOpen = false;
  let animation = null;

  function animateMenu(open) {
    if (animation) animation.kill();

    animation = gsap.timeline();

    if (open) {
      animation
        .to(menu, { x: "0%", opacity: 1, duration: 0.8, ease: easeInOutCubic })
        .to(
          menuElements.triggerText,
          { y: "-100%", duration: 0.5, ease: easeOutExpo },
          0
        )
        .fromTo(
          [...menuElements.linkTitles, ...menuElements.social],
          { y: "150%" },
          { y: "0%", duration: 0.5, stagger: 0.05, ease: easeOutExpo },
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
      animateMenu(false).then(() => {
        document.body.classList.remove("menu-open");
        lenis.start();
      });
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

  menu.addEventListener("click", (e) => e.stopPropagation());

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && !link.classList.contains("secondary-nav-item")) {
        e.preventDefault();
        closeMenu();
        queueMicrotask(() => barba.go(href));
      }
    });
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
              initLogoReveal(); // Initialiser le logo après la transition
              initLinesAnimations();
              initLabGallery();
            },
          });
        },
      },
    ],
    prefetch: true, // Activation du préchargement
  });
}