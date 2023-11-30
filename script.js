document.addEventListener("DOMContentLoaded", function () {
  // Initialisation de Lenis Scroll
  const lenis = new Lenis({
    lerp: 0.1,
    orientation: "vertical",
    wheelMultiplier: 0.8,
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
  // Fin de Lenis Scroll

  // Page Loader
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
  const navElement = document.querySelector(".nav");
  const menuTrigger = document.querySelector(".menu-trigger");

  // Fonctions pour ouvrir et fermer le menu
  let isMenuOpen = false;
  let isAnimating = false;

  // Fonction pour ouvrir le menu
  function openMenu() {
    if (!isMenuOpen && !isAnimating) {
      isAnimating = true;
      navElement.style.mixBlendMode = "normal";

      // Désactiver le défilement
      document.body.classList.add("no-scroll");

      // Menu Trigger Text Animation [Start]
      gsap.to(".menu-trigger_text", {
        y: "-100%",
        duration: 0.4,
        delay: 0.2,
        ease: "power1.inOut",
      });

      gsap.to(menu, {
        y: "0%",
        duration: 1,
        ease: "power4.inOut",
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
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.1,
        delay: 0.4,
      });

      // Menu Link Num
      let typeSplitMenuNum = new SplitType(".menu-link_num", {
        types: "lines, words, chars",
      });

      gsap.from(".menu-link_num .line", {
        y: "400%",
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.1,
        delay: 0.4,
      });

      // Menu Social Link
      let typeSplitMenuSocialLink = new SplitType(".menu-social-link_title", {
        types: "lines, words, chars",
        tagName: "span",
      });

      gsap.from(".menu-social-link_title .word", {
        y: "200%",
        opacity: 1,
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.1,
        delay: 0.5,
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
        ease: "power4.inOut",
        onComplete: () => {
          navElement.style.mixBlendMode = "";
          isAnimating = false;
        },
      });

      // Menu Trigger Text Animation [End]
      gsap.to(".menu-trigger_text", {
        y: "0%",
        duration: 0.4,
        delay: 0.2,
        ease: "power1.inOut",
      });

      // Réactiver le défilement
      document.body.classList.remove("no-scroll");

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

  document.querySelectorAll(".menu a").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });

  // Initialise les animations !IMPORTANT
  initMenuLinkOpacity();
  initProjectImageScrollAnimation();
  initWorkHeroTitleAnimation();
  initProjectHeaderImageScrollAnimation();
  initPlaygroundAnimation();
  iniShuffleLine();
  initAccordion();
  initHomeHeroLogo();
});

//Home Hero Logo
function initHomeHeroLogo() {
  // Sélection des éléments à animer
  const letter = document.querySelector(".home-hero_logo-letter");
  const circle = document.querySelector(".home-hero_logo-circle");

  const duration = 1.2;
  const delayBetweenElements = 0.1;

  gsap.to(letter, {
    duration: duration,
    y: "0%",
    ease: "expo.out",
  });

  gsap.to(circle, {
    duration: duration,
    y: "0%",
    ease: "expo.out",
    delay: delayBetweenElements,
  });
}

//Opacity Project Item / Menu Link
function initMenuLinkOpacity() {
  var projectItems = $(".project-item");
  var menuLinks = $(".menu-link");

  projectItems.on("mouseenter", function () {
    var otherItems = projectItems.not(this);
    gsap.to(otherItems, {
      filter: "grayscale(100%)",
      duration: 0.4,
      ease: "power1.out",
    });
  });

  projectItems.on("mouseleave", function () {
    gsap.to(projectItems, {
      filter: "grayscale(0%)",
      duration: 0.4,
      ease: "power1.out",
    });
  });
}

//Home - Project Item Image Animation
function initProjectImageScrollAnimation() {
  const images = document.querySelectorAll(".project-img_background");

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

// Project - Title Animation
function initWorkHeroTitleAnimation() {
  if (window.innerWidth > 768 && document.querySelector(".project-title")) {
    let typeSplit = new SplitType(".project-title", {
      types: "lines, words, chars",
      tagName: "span",
    });

    gsap.from(".project-title .line", {
      y: "250%",
      duration: 1.2,
      ease: "power4.out",
      delay: 0.3,
      rotation: 10,
      skewY: 15,
    });
  }
}

//Project Header Image Animation
function initProjectHeaderImageScrollAnimation() {
  const images = document.querySelectorAll(".project-header-img");

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

// Playground Animation
function initPlaygroundAnimation() {
  // Vérifier si la largeur de la fenêtre est supérieure à 768px
  if (window.innerWidth > 768) {
    const playgroundRowItems = document.querySelectorAll(
      ".playground-list-item",
    );

    playgroundRowItems.forEach((rowItem) => {
      const title = rowItem.querySelector(".playground-item-title");
      const category = rowItem.querySelector(".playground-list-category");

      gsap.from([title, category], {
        y: "100%",
        stagger: 0.1, // Ajouter un léger délai entre les éléments
        scrollTrigger: {
          trigger: rowItem,
          start: "50% 50%",
          ease: "ease.out",
        },
      });
    });
  }
}

//Shuffle Line
function iniShuffleLine() {
  const elements = [
    // [Work] Ghibli Header
    { selector: "#num-ghibli-project", text: "1P", delay: 0.3 },
    {
      selector: "#label-ghibli-project",
      text: "JEEAPASN MNOIITAN OSATUIM",
      delay: 0.3,
    },
    { selector: "#date-ghibli-project", text: "3022", delay: 0.4 },

    // Playground Header
    {
      selector: "#header-label-playground",
      text: "CTYERATIVDME OEREFOD",
      delay: 0.4,
    },
    { selector: "#header-info-playground", text: "31-12" },

    // About Header
    { selector: "#header-label-about", text: "egrg", delay: 0.4 },
    { selector: "#header-info-about", text: "32", delay: 0.4 },

    // Playground All Project
    {
      selector: "#header-label-allprojects",
      text: "ESOM FO YM KORW",
      delay: 0.4,
    },
    { selector: "#header-info-allprojects", text: "3P", delay: 0.4 },

    // Process
    {
      selector: "#header-label-process",
      text: "RELIABLEVED",
      delay: 0.4,
    },
    { selector: "#header-info-process", text: "Z OA T", delay: 0.4 },
  ];

  elements.forEach((element) => {
    gsap.from(element.selector, {
      duration: 0.8,
      delay: element.delay,
      text: element.text,
      ease: "none",
    });
  });
}

//Accordion Settings
function initAccordion() {
  function handleClick(
    index,
    itemStates,
    processItems,
    stepItems,
    crossContainers,
  ) {
    const isExpanded = itemStates[index];
    const currentItem = processItems[index];
    const currentStep = stepItems[index];

    if (!isExpanded) {
      gsap.to(currentItem, { height: "13.25rem", duration: 0.5 });
      gsap.to(currentStep, { opacity: 1, duration: 0.1, delay: 0.1 });
      gsap.to(crossContainers[index], { rotation: 45, duration: 0.5 });
      itemStates[index] = true;
    } else {
      gsap.to(currentItem, { height: "4.25rem", duration: 0.5 });
      gsap.to(currentStep, { opacity: 0, duration: 0.1 });
      gsap.to(crossContainers[index], { rotation: 0, duration: 0.5 });
      itemStates[index] = false;
    }
  }

  function resetAnimations(processItems, stepItems, crossContainers) {
    gsap.set(processItems, { clearProps: "height" });
    gsap.set(stepItems, { opacity: 0 });
    gsap.set(crossContainers, { rotation: 0 });
  }

  function handleWindowSize() {
    const windowWidth = window.innerWidth;
    const infoItems = document.querySelectorAll(".process-list_item-info");
    const processItems = document.querySelectorAll(".process-list_item");
    const stepItems = document.querySelectorAll(".process-list_step");
    const crossContainers = document.querySelectorAll(".cross-container");

    if (windowWidth <= 990) {
      const itemStates = Array.from({ length: infoItems.length }, () => false);

      infoItems.forEach((item, index) => {
        item.addEventListener("click", () => {
          handleClick(
            index,
            itemStates,
            processItems,
            stepItems,
            crossContainers,
          );
        });
      });
    } else {
      resetAnimations(processItems, stepItems, crossContainers);
    }
  }

  window.addEventListener("resize", handleWindowSize);
  handleWindowSize(); // Vérification initiale lors du chargement de la page
}

// Page Transition Animation [ENTER]
function pageEnterAnimation() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: resolve,
    });

    // Désactiver le défilement lors de la transition de page
    document.body.classList.add("no-scroll");

    tl.set(".page-transition", { display: "block" }).to(".page-transition", {
      duration: 1,
      y: "0%",
      ease: "power4.inOut",
    });
  });
}

// Page Transition Animation [EXIT]
function pageExitAnimation() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Réactiver le défilement après la transition de page
        document.body.classList.remove("no-scroll");
        resolve();
      },
    });

    tl.set(".page-transition", { y: "0%" })
      .to(".page-transition", {
        duration: 0.8,
        y: "-100%",
        ease: "power4.inOut",
      })
      .set(".page-transition", { display: "none", y: "100%" });
  });
}

function updateCurrentClass() {
  $(".w-current").removeClass("w--current");
  $(".nav a").each(function () {
    if ($(this).attr("href") === window.location.pathname) {
      $(this).addClass("w-current");
    }
  });
}

function updateCurrentClass() {
  $(".w-current").removeClass("w--current");
  $(".nav a").each(function () {
    if ($(this).attr("href") === window.location.pathname) {
      $(this).addClass("w-current");
    }
  });
}

// Reset Webflow Animation for BarbaJS
function resetWebflow(data) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(data.next.html, "text/html");
  let webflowPageId = $(dom).find("html").attr("data-wf-page");
  $("html").attr("data-wf-page", webflowPageId);
  window.Webflow && window.Webflow.destroy();
  window.Webflow && window.Webflow.ready();
  window.Webflow && window.Webflow.require("ix2").init();
}

// BarbaJS Initialisation
barba.init({
  transitions: [
    {
      preventRunning: true,
      async leave(data) {
        await pageEnterAnimation();
      },
      enter(data) {
        updateCurrentClass();
        $(data.next.container).addClass("fixed");

        resetWebflow(data);

        gsap.to(data.next.container, {
          onComplete: () => {
            $(data.next.container).removeClass("fixed");
            $(window).scrollTop(0);
            pageExitAnimation();
            initMenuLinkOpacity();
            initProjectImageScrollAnimation();
            initWorkHeroTitleAnimation();
            initProjectHeaderImageScrollAnimation();
            initPlaygroundAnimation();
            iniShuffleLine();
            initAccordion();
            initHomeHeroLogo();

            // Intégration de la lecture des vidéos après la transition
            var videos = data.next.container.querySelectorAll("video");
            videos.forEach(function (video) {
              video.play();
            });
          },
        });
      },
    },
  ],
});
