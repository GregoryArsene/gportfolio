gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", function () {
  // Initialisation de Lenis Scroll
  const lenis = new Lenis({
    lerp: 0.1,
    orientation: "vertical",
    wheelMultiplier: 1.2,
  });

  lenis.on("scroll", (e) => {
    // Affichage de l'objet de l'événement de défilement pour le débogage
    console.log(e);
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  // Démarre la boucle d'animation pour Lenis
  requestAnimationFrame(raf);

  // Page loader
  function hideLoader() {
    var loader = document.querySelector(".page-loader");
    if (loader) {
      loader.style.display = "none";
    }
  }

  window.addEventListener(
    "load",
    function () {
      var loaderTimeline = gsap.timeline();
      var animationDuration = 1;

      // Loader State
      var loaderState = document.querySelector(".page-loader_state");
      if (loaderState) {
        var counter = 0;
        var updateLoaderState = function () {
          loaderState.innerHTML = counter;
          counter++;
          if (counter <= 100) {
            requestAnimationFrame(updateLoaderState);
          } else {
            loaderTimeline.to(".page-loader", {
              duration: animationDuration,
              y: "-100%",
              ease: "expo.inOut",
              delay: 0.3,
            });
            loaderTimeline.add(function () {
              hideLoader();
            });
          }
        };
        requestAnimationFrame(updateLoaderState);
      }
    },
    { once: true },
  );

  // Initialisation des éléments et variables
  const menu = document.querySelector(".menu");
  const headerElement = document.querySelector(".header");
  const menuTrigger = document.querySelector(".menu-trigger");
  const navLogoContainer = document.querySelector(".nav-logo-container"); // Sélectionner l'élément du logo

  // Fonctions pour ouvrir et fermer le menu
  let isMenuOpen = false;
  let isAnimating = false;

  // Fonction pour ouvrir le menu
  function openMenu() {
    if (!isMenuOpen && !isAnimating) {
      isAnimating = true;
      headerElement.style.mixBlendMode = "normal";

      // Menu Trigger Text Animation [Start]
      gsap.to(".menu-trigger_text", {
        y: "-100%",
        duration: 0.5,
        delay: 0,
        ease: "power1.inOut",
      });
      gsap.to(menu, {
        y: "0%",
        duration: 1,
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
        display: "flex",
        onComplete: () => {
          isAnimating = false;
        },
      });

      // Menu Link Title
      let typeSplitMenuLinkTitle = new SplitType(".menu-link_title", {
        types: "lines, words, chars",
      });
      gsap.from(".menu-link_title .line", {
        y: "200%",
        duration: 0.8,
        ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
        stagger: 0.1,
        delay: 0.5,
      });
      gsap.from(".menu-img", {
        scale: 1.5,
        duration: 1.2,
        delay: 0.4,
        ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
      });

      // Menu Social Link
      let typeSplitMenuSocialLink = new SplitType(".menu-social_link-title", {
        types: "lines, words, chars",
        tagName: "span",
      });
      gsap.from(".menu-social_link-title .word", {
        y: "200%",
        opacity: 1,
        duration: 1,
        ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
        stagger: 0.1,
        delay: 0.6,
      });

      isMenuOpen = true;
    }
  }

  // Fonction pour fermer le menu
  function closeMenu() {
    if (isMenuOpen && !isAnimating) {
      isAnimating = true;
      gsap.to(menu, {
        y: "-100%",
        duration: 1,
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1"),
        display: "none",
        onComplete: () => {
          headerElement.style.mixBlendMode = "";
          isAnimating = false;
        },
      });

      // Menu Trigger Text Animation [End]
      gsap.to(".menu-trigger_text", {
        y: "0%",
        duration: 0.4,
        delay: 0.3,
        ease: "power1.inOut",
      });

      isMenuOpen = false;
    }
  }

  // Fonction pour appliquer l'opacité réduite aux autres liens du menu lorsqu'un lien est survolé
  function handleMenuLinkHover() {
    const menuLinks = document.querySelectorAll(".menu-link");
    menuLinks.forEach((link) => {
      if (link !== this) {
        gsap.to(link, { opacity: 0.3, duration: 0.3 });
      }
    });
  }

  // Fonction pour restaurer l'opacité normale des autres liens du menu
  function handleMenuLinkLeave() {
    const menuLinks = document.querySelectorAll(".menu-link");
    menuLinks.forEach((link) => {
      gsap.to(link, { opacity: 1, duration: 0.3 });
    });
  }

  // Ajouter des écouteurs d'événements pour gérer le survol des liens du menu
  const menuLinks = document.querySelectorAll(".menu-link");
  menuLinks.forEach((link) => {
    link.addEventListener("mouseenter", handleMenuLinkHover);
    link.addEventListener("mouseleave", handleMenuLinkLeave);
  });

  // Écouteur d'événement pour le bouton de déclenchement du menu
  menuTrigger.addEventListener("click", () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Écouteur d'événement pour les liens du menu (sauf le logo)
  document
    .querySelectorAll(".menu a:not(.nav-logo-container a)")
    .forEach((el) => {
      el.addEventListener("click", closeMenu);
    });

  // Écouteur d'événement pour le logo (pour fermer le menu lors du clic)
  navLogoContainer.addEventListener("click", () => {
    if (isMenuOpen) {
      closeMenu();
    }
  });

  document.querySelectorAll(".menu a").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });

  // Initialise les animations !IMPORTANT
  initLineLeftText();
  initRightText();
  initLinesText();
  initMenuLinkOpacity();
  initWorkItem();
  initWorkPageHero();
});

// Variables globales
let animationPlayed = false;
let splitElements = [];

// Écoutez l'événement 'barbaAfterEnter'
barba.hooks.afterEnter(() => {
  if (!animationPlayed) {
    initLineLeftText();
    initRightText();
    initLinesText();
    animationPlayed = true;
  }
});

function initLineLeftText() {
  const elements = document.querySelectorAll("[line-left]");
  splitElements = []; // Réinitialiser le tableau d'éléments

  elements.forEach((element) => {
    // Réinitialisation de SplitType
    if (element._splitType) {
      SplitType.revert(element);
    }

    const split = new SplitType(element, { types: "lines" });
    splitElements.push(split); // Stocker l'instance SplitType

    // Créer un conteneur avec overflow-hidden pour chaque ligne
    split.lines.forEach((line, index) => {
      const lineWrapper = document.createElement("div");
      lineWrapper.style.overflow = "hidden";
      line.parentNode.insertBefore(lineWrapper, line);
      lineWrapper.appendChild(line);

      // Animation sans ScrollTrigger
      gsap.fromTo(
        line,
        { y: "300%" },
        {
          y: "0%",
          duration: 0.8,
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
          delay: 0.5 + index * 0.1,
        },
      );
    });
  });
}

function initRightText() {
  const elements = document.querySelectorAll("[line-right]");
  elements.forEach((element) => {
    gsap.fromTo(
      element,
      { y: "100%" },
      {
        y: "0%",
        duration: 0.8,
        ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
        delay: 0.7,
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
        },
      },
    );
  });
}

function initLinesText() {
  const elements = document.querySelectorAll("[lines]");
  splitElements = [];

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

      // Animation avec ScrollTrigger
      gsap.fromTo(
        line,
        { y: "100%" }, // Déplacement vertical initial (lignes en dehors de la fenêtre)
        {
          y: "0%", // Déplacement vertical final (lignes à leur position normale)
          duration: 0.8,
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
          delay: 0.1 + index * 0.06,
          scrollTrigger: {
            trigger: lineWrapper,
            start: "top 150%", // Démarrer l'animation lorsque le haut de la ligne atteint le bas de la fenêtre
          },
        },
      );
    });
  });
}

// Fonction pour mettre à jour les éléments SplitType
function updateSplitText() {
  splitElements.forEach((split) => {
    // Mettre à jour SplitType pour refléter les changements de taille
    split.split();
  });
}

// Écouteur d'événement pour le redimensionnement
window.addEventListener("resize", () => {
  updateSplitText();
});

// Grayscale Project Item
function initMenuLinkOpacity() {
  var projectItems = $(".home-work_item");
  projectItems.on("mouseenter", function () {
    var otherItems = projectItems.not(this);
    gsap.to(otherItems, {
      filter: "grayscale(100%)",
      duration: 0.3,
      ease: "power1.out",
    });
  });
  projectItems.on("mouseleave", function () {
    gsap.to(projectItems, {
      filter: "grayscale(0%)",
      duration: 0.3,
      ease: "power1.out",
    });
  });
}

// Home - Project Item Image Animation
function initWorkItem() {
  const images = document.querySelectorAll(".work_img");
  images.forEach((img) => {
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

function initWorkPageHero() {
  const workHeroImg = document.querySelector(".work-hero_img");
  // Animation initiale du héros
  gsap.to(workHeroImg, {
    duration: 1.2,
    scale: 1,
    delay: 0.4,
    ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
  });
  // Animation du défilement du héros
  gsap.to(workHeroImg, {
    y: 0,
    scrollTrigger: {
      trigger: workHeroImg,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.1,
      ease: "none",
    },
  });
  // Écoutez l'événement de redimensionnement de la fenêtre
  window.addEventListener("resize", () => {
    // Mettez à jour la taille du texte lors du redimensionnement
    splitTitle.revert();
    splitNum.revert();
  });
}

// Page Transition Animation [ENTER]
function pageEnterAnimation() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: resolve,
    });
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
        "-=1",
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
        "-=1",
      );
  });
}

// Page Transition Animation [EXIT]
function pageExitAnimation() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: resolve,
    });
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
        "-=1",
      )
      .to(
        ".opacity-transition",
        {
          duration: 1,
          opacity: 0,
          ease: "linear",
        },
        "-=1",
      ) // Start simultaneously with the ".page-transition" animation
      .set(".page-transition", { display: "none", y: "100%" });
  });
}

function updateCurrentClass() {
  $(".w-current").removeClass("w--current");
  $(".nav a").each(function () {
    if ($(this).attr("href") === window.location.pathname) {
      $(this).addClass("w--current");
    }
  });
}

function resetWebflow(data) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(data.next.html, "text/html");
  let webflowPageId = $(dom).find("html").attr("data-wf-page");
  if (window.Webflow) {
    $("html").attr("data-wf-page", webflowPageId);
    if (window.Webflow.destroy) {
      window.Webflow.destroy();
    }
    if (window.Webflow.ready) {
      window.Webflow.ready();
    }
    let ix2Module = window.Webflow.require("ix2");
    if (ix2Module && ix2Module.init) {
      ix2Module.init();
    }
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
          // Aucune sortie d'erreur ici pour éviter la pollution de la console
        }
      },
      enter(data) {
        try {
          updateCurrentClass();
          $(data.next.container).addClass("fixed");
          resetWebflow(data);
          gsap.to(data.next.container, {
            onComplete: () => {
              $(data.next.container).removeClass("fixed");
              $(window).scrollTop(0);
              pageExitAnimation();
              initLineLeftText();
              initRightText();
              initLinesText();
              initMenuLinkOpacity();
              initWorkItem();
              initWorkPageHero();
              // Intégration de la lecture des vidéos après la transition
              var videos = data.next.container.querySelectorAll("video");
              videos.forEach(function (video) {
                video.play();
              });
            },
          });
        } catch (error) {
          // Aucune sortie d'erreur ici pour éviter la pollution de la console
        }
      },
    },
  ],
});
