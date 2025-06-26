const debounce = (e, t, o = !1) => {
  let n;
  return function (...r) {
    const i = o && !n;
    clearTimeout(n),
      (n = setTimeout(() => {
        (n = null), o || e.apply(this, r);
      }, t)),
      i && e.apply(this, r);
  };
};

const EASES = {
  customInOut: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1"),
  menuLinkReveal: CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1"),
  reveal: CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1"),
};

let smoother;

// Fonction utilitaire pour détecter les appareils mobiles/tactiles
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768
  );
}

// Fonction utilitaire pour détecter iOS spécifiquement
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function initScrollSmoother() {
  // Nettoyer l'instance précédente
  if (smoother) {
    smoother.kill();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }

  const isMobile = isMobileDevice();
  const iOS = isIOS();

  // Sur mobile, on désactive complètement ScrollSmoother pour éviter les conflits
  // avec le redimensionnement de la barre d'adresse
  if (isMobile || iOS) {
    smoother = null;

    // On s'assure que le wrapper et content sont configurés correctement
    // pour un scroll natif
    const wrapper = document.querySelector("#smooth-wrapper");
    const content = document.querySelector("#smooth-content");

    if (wrapper && content) {
      // Reset des styles qui pourraient être appliqués par ScrollSmoother
      gsap.set(wrapper, { clearProps: "all" });
      gsap.set(content, { clearProps: "all" });

      // Application des styles pour le scroll natif
      wrapper.style.height = "auto";
      wrapper.style.overflow = "visible";
      content.style.transform = "none";
      content.style.willChange = "auto";
    }

    // Refresh des ScrollTriggers pour qu'ils fonctionnent avec le scroll natif
    ScrollTrigger.refresh();
    return null;
  } else {
    // Configuration desktop complète
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      effects: true,
      speed: 1,
      normalizeScroll: true,
    });
  }

  return smoother;
}

// Fonction MODIFIÉE : initMenu
function initMenu() {
  const menuElement = document.querySelector(".menu");
  const menuTrigger = document.querySelector(".menu-trigger");

  if (!menuElement || !menuTrigger) {
    // Retourner un objet factice pour éviter les erreurs
    return { openMenu: () => {}, closeMenu: () => {}, isMenuOpen: () => false };
  }

  let isMenuOpen = false; // 'o' renommé en 'isMenuOpen' pour la clarté

  const elements = {
    triggerText: document.querySelectorAll(".menu-trigger_text"),
    linkTitles: document.querySelectorAll(".primary-nav_title"),
    linkNumbers: document.querySelectorAll(".primary-nav_num"),
    social: document.querySelectorAll(".secondary-nav_title"),
    label: document.querySelectorAll(".menu-bottom_label"),
  };

  const openTimeline = gsap
    .timeline({ paused: true, defaults: { overwrite: "auto" } })
    // ... (le reste de la timeline d'ouverture reste identique)
    .to(menuElement, {
      x: "0%",
      opacity: 1,
      duration: 0.8,
      ease: EASES.customInOut,
    })
    .to(
      elements.triggerText,
      { y: "-100%", duration: 0.5, ease: EASES.menuLinkReveal },
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
      { y: "0%", duration: 0.5, stagger: 0.05, ease: EASES.menuLinkReveal },
      0.2
    );

  const closeTimeline = gsap
    .timeline({ paused: true, defaults: { overwrite: "auto" } })
    .to(menuElement, { opacity: 0, duration: 0.2, ease: "power2.inOut" })
    .to(
      elements.triggerText,
      { y: "0%", duration: 0.3, ease: "power2.inOut" },
      0
    )
    .set(menuElement, { x: "100%" });

  const openMenu = () => {
    if (isMenuOpen) return;
    isMenuOpen = true;
    document.body.classList.add("menu-open");
    openTimeline.restart();
    menuElement.setAttribute("aria-hidden", "false");
    menuTrigger.setAttribute("aria-expanded", "true");
  };

  // =========================================================================
  // MODIFICATION DE LA FONCTION DE FERMETURE
  // =========================================================================
  const closeMenu = (instant = false) => {
    if (!isMenuOpen) return;

    isMenuOpen = false;
    document.body.classList.remove("menu-open");
    menuElement.setAttribute("aria-hidden", "true");
    menuTrigger.setAttribute("aria-expanded", "false");

    if (instant) {
      // Si la fermeture doit être instantanée (cas du bfcache)
      // On arrête toute animation en cours et on met directement les styles de fin.
      gsap.killTweensOf([menuElement, elements.triggerText]); // Arrête les animations en cours
      gsap.set(menuElement, { x: "100%", opacity: 0 });
      gsap.set(elements.triggerText, { y: "0%" });
    } else {
      // Comportement normal avec animation
      closeTimeline.duration(0.2).restart();
    }
  };

  const handleResizeForMenu = debounce(() => {
    if (window.innerWidth > 568 && isMenuOpen) {
      closeMenu(true); // Fermeture instantanée au redimensionnement
    }
  }, 200);

  document.addEventListener("click", (event) => {
    if (menuTrigger.contains(event.target)) {
      event.stopPropagation();
      isMenuOpen ? closeMenu() : openMenu();
    } else if (isMenuOpen && !menuElement.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen) {
      closeMenu();
    }
  });

  window.addEventListener("resize", handleResizeForMenu);

  // On expose l'état et les fonctions
  return { openMenu, closeMenu, isMenuOpen: () => isMenuOpen };
}

function resetWebflow() {
  try {
    window.Webflow?.destroy(),
      window.Webflow?.ready(),
      window.Webflow?.require("ix2")?.init();
  } catch (e) {
    console.error("Webflow reset error:", e);
  }
}

function initVideoPlayer() {
  // Variables
  let isPlaying = false;
  let fadeTimeout = null;
  let isHovering = false;
  const morphPath1 = document.getElementById("morphPath1");
  const morphPath2 = document.getElementById("morphPath2");
  const videoControls = document.getElementById("videoControls");
  const videoControlsText = document.getElementById("videoControlsText");
  const videoIndicator = document.getElementById("videoIndicator");
  const videoTitle = document.getElementById("videoTitle");
  const videoDuration = document.getElementById("videoDuration");
  const videoInfosTop = document.getElementById("VideoIdTop");
  const videoInfosBtm = document.getElementById("VideoIdBtm");
  const video = document.querySelector("video"); // Adaptez le sélecteur selon votre HTML

  // Fonction pour formater la durée en mm:ss (temps restant)
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Fonction pour mettre à jour le temps restant
  function updateTimeRemaining() {
    if (video && videoDuration) {
      const timeRemaining = video.duration - video.currentTime;
      videoDuration.textContent = formatDuration(timeRemaining);
    }
  }

  // Fonction pour faire disparaître les textes avec fade
  function fadeOutTexts() {
    if (isHovering) return; // Ne pas masquer si on survole

    if (videoTitle) {
      gsap.to(videoTitle, {
        duration: 0.5,
        opacity: 0,
        ease: "power2.out",
      });
    }

    if (videoDuration) {
      gsap.to(videoDuration, {
        duration: 0.5,
        opacity: 0,
        ease: "power2.out",
      });
    }
  }

  // Fonction pour faire réapparaître les textes
  function fadeInTexts() {
    if (videoTitle) {
      gsap.to(videoTitle, {
        duration: 0.5,
        opacity: 1,
        ease: "power2.out",
      });
    }

    if (videoDuration) {
      gsap.to(videoDuration, {
        duration: 0.5,
        opacity: 1,
        ease: "power2.out",
      });
    }
  }

  // Fonction pour faire disparaître les éléments de contrôle
  function fadeOutControls() {
    if (isHovering) return; // Ne pas masquer si on survole

    const elementsToFade = [videoInfosTop, videoInfosBtm, videoControls];

    elementsToFade.forEach((element) => {
      if (element) {
        gsap.to(element, {
          duration: 0.5,
          opacity: 0,
          ease: "power2.out",
        });
      }
    });
  }

  // Fonction pour faire réapparaître les éléments de contrôle
  function fadeInControls() {
    const elementsToFade = [videoInfosTop, videoInfosBtm, videoControls];

    elementsToFade.forEach((element) => {
      if (element) {
        gsap.to(element, {
          duration: 0.5,
          opacity: 1,
          ease: "power2.out",
        });
      }
    });
  }

  // Formes des paths
  const playShapes = {
    path1: "5 2.5 5 12 5 21.5 5 21.5 21 12 5 2.5 5 2.5",
    path2: "11.7 6.5 11.7 17.5 18.1 13.7 21 12 13.7 7.7 11.7 6.5",
  };

  const pauseShapes = {
    path1: "5 2.5 5 12 5 21.5 8.3 21.5 8.3 2.5 5 2.5 5 2.5",
    path2: "15 2.5 15 21.5 18.3 21.5 18.3 12 18.3 2.5 15 2.5",
  };

  // Fonction de morphing vers play
  function morphToPlay() {
    gsap.to(morphPath1, {
      duration: 0.5,
      attr: { points: playShapes.path1 },
      ease: "power2.inOut",
    });

    gsap.to(morphPath2, {
      duration: 0.3,
      attr: { points: playShapes.path2 },
      ease: "power2.inOut",
    });

    isPlaying = false;

    // Mettre à jour le texte
    if (videoControlsText) {
      videoControlsText.textContent = "PLAY";
    }

    // Remettre la couleur d'origine de l'indicateur
    if (videoIndicator) {
      videoIndicator.style.borderBottomColor = ""; // Remet la couleur CSS par défaut
    }

    // Annuler le timeout et faire réapparaître les textes et contrôles
    if (fadeTimeout) {
      clearTimeout(fadeTimeout);
      fadeTimeout = null;
    }
    fadeInTexts();
    fadeInControls();
  }

  // Fonction de morphing vers pause
  function morphToPause() {
    gsap.to(morphPath1, {
      duration: 0.5,
      attr: { points: pauseShapes.path1 },
      ease: "power2.inOut",
    });

    gsap.to(morphPath2, {
      duration: 0.5,
      attr: { points: pauseShapes.path2 },
      ease: "power2.inOut",
    });

    isPlaying = true;

    // Mettre à jour le texte
    if (videoControlsText) {
      videoControlsText.textContent = "PAUSE";
    }

    // Changer la couleur de l'indicateur en rouge
    if (videoIndicator) {
      videoIndicator.style.borderBottomColor = "red";
    }

    // Programmer la disparition des textes et contrôles après 3 secondes
    fadeTimeout = setTimeout(() => {
      fadeOutTexts();
      fadeOutControls();
    }, 3000);
  }

  // Fonction pour jouer la vidéo
  function playVideo() {
    if (video) {
      video.play().catch((error) => {
        console.error("Erreur lors de la lecture de la vidéo:", error);
      });
    }
  }

  // Fonction pour mettre en pause la vidéo
  function pauseVideo() {
    if (video) {
      video.pause();
    }
  }

  // Fonction de toggle
  function togglePlayPause() {
    if (isPlaying) {
      morphToPlay();
      pauseVideo();
    } else {
      morphToPause();
      playVideo();
    }
  }

  // Event listener sur le clic
  if (video) {
    video.addEventListener("click", togglePlayPause);
  }

  // Initialisation : s'assurer que la forme play est visible au début
  if (morphPath1 && morphPath2) {
    morphPath1.setAttribute("points", playShapes.path1);
    morphPath2.setAttribute("points", playShapes.path2);
  }

  // Initialisation du texte
  if (videoControlsText) {
    videoControlsText.textContent = "PLAY";
  }

  // Récupérer et afficher la durée de la vidéo
  if (video && videoDuration) {
    // Si les métadonnées sont déjà chargées
    if (video.duration) {
      videoDuration.textContent = formatDuration(video.duration);
    } else {
      // Attendre que les métadonnées se chargent
      video.addEventListener("loadedmetadata", () => {
        videoDuration.textContent = formatDuration(video.duration);
      });
    }

    // Mettre à jour le temps restant pendant la lecture
    video.addEventListener("timeupdate", updateTimeRemaining);
  }

  // Gestion du hover sur la vidéo
  if (video) {
    video.addEventListener("mouseenter", () => {
      isHovering = true;
      fadeInTexts();
      fadeInControls();
    });

    video.addEventListener("mouseleave", () => {
      isHovering = false;
      // Si la vidéo joue, programmer la disparition après 3 secondes
      if (isPlaying) {
        if (fadeTimeout) {
          clearTimeout(fadeTimeout);
        }
        fadeTimeout = setTimeout(() => {
          fadeOutTexts();
          fadeOutControls();
        }, 3000);
      }
    });
  }

  // Optionnel : synchroniser avec les événements natifs de la vidéo
  if (video) {
    video.addEventListener("play", () => {
      if (!isPlaying) {
        morphToPause();
      }
    });

    video.addEventListener("pause", () => {
      if (isPlaying) {
        morphToPlay();
      }
    });
  }

  // Retourner les fonctions si besoin d'accès externe
  return {
    play: morphToPause,
    pause: morphToPlay,
    toggle: togglePlayPause,
    isPlaying: () => isPlaying,
  };
}

function highlightCurrentPageDot() {
  const e =
    window.location.pathname.split("/").pop().replace(".html", "") ||
    "home_page_no_dot";
  if (
    (document
      .querySelectorAll(".header-item_dot")
      .forEach((e) => e.classList.remove("active-dot")),
    ["projects", "about", "lab"].includes(e))
  ) {
    const t = document.getElementById(`${e}-dot`);
    t?.classList.add("active-dot");
  }
}

function initHeaderAnimation() {
  const e = document.querySelector(".header-logo"),
    t = gsap.utils.toArray(".header_list-item");
  if (!e && 0 === t.length) return;
  gsap.set([e, ...t], { clearProps: "all" });
  gsap.set(e, { y: "300%" }), gsap.set(t, { y: "100%" });
  const o = gsap.timeline({
    defaults: {
      overwrite: "auto",
      ease: CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1"),
    },
  });
  o.to(e, { y: "0%", duration: 0.5 }),
    o.to(t, { y: "0%", duration: 0.5, stagger: 0.1 }, "<0.2");
}

function setupHeaderVisibilityObserver() {
  const headerNav = document.querySelector(".header-nav");
  if (!headerNav) return;
  let isAnimated = false;
  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const isVisible = entry.contentRect.height > 0;
      if (isVisible && !isAnimated) {
        isAnimated = true;
        initHeaderAnimation();
      } else if (!isVisible && isAnimated) {
        isAnimated = false;
        const logo = document.querySelector(".header-logo");
        const navItems = gsap.utils.toArray(".header_list-item");
        gsap.set([logo, ...navItems], { clearProps: "all" });
      }
    }
  });
  observer.observe(headerNav);
}

function initSplitTextAnimations() {
  if (void 0 === window.gsap || void 0 === window.SplitText)
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
                    autoSplit: !0,
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

function initStrokeAnimations() {
  ScrollTrigger.batch('[data-anim-stroke="true"]', {
    once: !0,
    onEnter: (e) =>
      gsap.to(e, {
        "--stroke-width": "100%",
        duration: 0.75,
        ease: EASES.reveal,
        stagger: 0.2,
      }),
  });
}

function initIllustration() {
  gsap.utils.toArray("[data-illustration]").forEach((e) => {
    gsap.from(e, {
      y: "200%",
      autoAlpha: 0,
      duration: 0.5,
      ease: CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1"),
      scrollTrigger: { trigger: e, start: "top 85%", once: !0 },
    });
  });
}

function manageCardHoverAnimations() {
  const e = window.innerWidth > 1024 && navigator.maxTouchPoints < 1;
  gsap.utils.toArray(".home-work_card-visual").forEach((t) => {
    t._hoverTimeline && (t._hoverTimeline.kill(), (t._hoverTimeline = null)),
      t._mouseEnterHandler &&
        t.removeEventListener("mouseenter", t._mouseEnterHandler),
      t._mouseLeaveHandler &&
        t.removeEventListener("mouseleave", t._mouseLeaveHandler);
    const o = t.querySelector(".card-label_path"),
      n = t.querySelector(".card-label_text");
    if (
      (o && gsap.set(o, { clearProps: "all" }),
      n && gsap.set(n, { clearProps: "all" }),
      e)
    ) {
      if (!o || !n) return;
      gsap.set(n, { opacity: 0, y: "20%" }), gsap.set(o, { drawSVG: "0%" });
      const e = gsap.timeline({ paused: !0 });
      e
        .to(o, {
          drawSVG: "100%",
          duration: 0.75,
          ease: CustomEase.create("custom", "M0,0 C0.45,0 0,1 1,1"),
        })
        .to(
          n,
          {
            opacity: 1,
            y: "0%",
            duration: 0.3,
            ease: CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1"),
          },
          "<0.2"
        ),
        (t._hoverTimeline = e),
        (t._mouseEnterHandler = () => e.play()),
        (t._mouseLeaveHandler = () => e.reverse()),
        t.addEventListener("mouseenter", t._mouseEnterHandler),
        t.addEventListener("mouseleave", t._mouseLeaveHandler);
    }
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
  }),
    n.from(
      t,
      {
        y: "20%",
        autoAlpha: 0,
        duration: 0.75,
        ease: CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1"),
      },
      "<0.1"
    ),
    o &&
      gsap.to(o, {
        y: "0%",
        duration: 0.75,
        ease: CustomEase.create("custom", "M0,0 C0.2,0.6 0.34,1 1,1"),
      });
}

function initImagePlaceholders() {
  document.querySelectorAll("[data-image-loader]").forEach((e) => {
    const t = e.querySelector("img");
    if (!t) return void console.warn("Aucune image trouvée dans le loader:", e);
    const o = () => {
      e.classList.contains("is-loaded") || e.classList.add("is-loaded");
    };
    ScrollTrigger.create({
      trigger: e,
      start: "top 85%",
      once: !0,
      onEnter: () => {
        t.complete ? o() : t.addEventListener("load", o, { once: !0 });
      },
    }),
      t.complete && getComputedStyle(e).top < window.innerHeight && o();
  });
}

function initViewSwitcher() {
  const e = document.querySelector(".btn-view-grid"),
    t = document.querySelector(".btn-view-index"),
    o = document.querySelector(".work-grid"),
    n = document.querySelector(".work-index"),
    r = document.querySelector(".work-views-container");
  if (!(e && t && o && n && r)) return;
  const i = [e, t];
  e.classList.add("is-active");
  const a = (e, t) => {
    const o = t.offsetHeight;
    gsap.set(e, { position: "relative", visibility: "hidden", opacity: 1 });
    const n = e.offsetHeight;
    gsap.set(e, { position: "absolute", visibility: "hidden", opacity: 0 }),
      gsap.set(r, { height: o }),
      gsap.set(t, { position: "absolute" }),
      gsap.set(e, { position: "absolute" });
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(e, {
            position: "relative",
            clearProps: "height,width,top,left",
          }),
            gsap.set(r, { clearProps: "height" }),
            gsap.set(t, { visibility: "hidden" }),
            ScrollTrigger.refresh();
        },
      })
      .to(r, { height: n, duration: 0.4, ease: "power2.inOut" })
      .to(t, { opacity: 0, duration: 0.3 }, 0)
      .to(e, { opacity: 1, visibility: "visible", duration: 0.3 }, 0.1);
  };
  i.forEach((t) => {
    t.addEventListener("click", () => {
      t.classList.contains("is-active") ||
        (i.forEach((e) => e.classList.remove("is-active")),
        t.classList.add("is-active"),
        t === e ? a(o, n) : a(n, o));
    });
  });
}

function initLabGallery() {
  const e = document.querySelector(".lab-gallery_content");
  if (!e) return;
  const t = window.innerWidth > 1024 && navigator.maxTouchPoints < 1;
  let o = 0;
  const n = Array.from(e.querySelectorAll(".lab-grid_item"));
  if (0 === n.length) return;
  function r() {
    const r = window
      .getComputedStyle(e)
      .getPropertyValue("grid-template-columns")
      .split(" ")
      .filter((e) => "0px" !== e && e).length;
    if (0 === r) return;
    o = r;
    const i = Array.from({ length: r }, () => []);
    n.forEach((e, t) => {
      i[t % r].push(e);
    });
    const a = document.createDocumentFragment(),
      s = (r - 1) / 2,
      l = [];
    i.forEach((e, t) => {
      const o = document.createElement("div");
      (o.className = "lab-gallery_column"),
        e.forEach((e) => o.appendChild(e)),
        a.appendChild(o);
      const n = 0 + 0.05 * Math.abs(t - s);
      l.push({ element: o, lag: n });
    }),
      (e.innerHTML = ""),
      e.appendChild(a),
      (e.style.display = "flex"),
      t &&
        smoother &&
        l.forEach(({ element: e, lag: t }) => {
          smoother.effects(e, { speed: 1, lag: t });
        }),
      e.classList.add("gallery-is-ready");
  }
  document.fonts.ready.then(() => {
    setTimeout(r, 50);
  });
}

// =========================================================================
// NOUVELLE FONCTION : AJUSTER LES ATTRiBUTS POUR L'AFFICHAGE STATIQUE
// =========================================================================
function ajusterAttributsSelonEcran() {
  const isMobileOrSmallScreen =
    navigator.maxTouchPoints > 0 || window.innerWidth < 1024;

  // 1. Gérer les animations de stroke
  document.querySelectorAll("[data-anim-stroke]").forEach((el) => {
    // Si on est sur mobile/petit écran, on met l'attribut à 'false' pour que le CSS l'affiche directement.
    // Sinon, on s'assure qu'il est sur 'true' pour que l'animation ScrollTrigger fonctionne sur desktop.
    el.dataset.animStroke = isMobileOrSmallScreen ? "false" : "true";
  });

  // 2. Gérer les placeholders d'images
  // L'attribut est 'data-image-loader' dans votre code JS.
  document.querySelectorAll("[data-image-loader]").forEach((el) => {
    if (isMobileOrSmallScreen) {
      // Sur mobile, on ajoute directement la classe 'is-loaded' pour révéler l'image,
      // sans attendre ScrollTrigger.
      el.classList.add("is-loaded");
    } else {
      // Sur desktop, on s'assure que la classe n'est pas présente au départ
      // pour que l'animation au scroll puisse se faire.
      // (Attention, cela ne fonctionnera que si l'utilisateur redimensionne sa fenêtre)
      // La logique de base dans initImagePlaceholders gère le cas initial.
      // On n'a pas besoin de 'else' ici si la page est rechargée.
    }
  });

  // Vous pouvez ajouter ici d'autres logiques pour d'autres types d'animations
  // qui doivent être désactivées de la même manière.
}

function initializeAllAnimations() {
  setupHeaderVisibilityObserver();
  initSplitTextAnimations();
  initStrokeAnimations();
  initIllustration();
  manageCardHoverAnimations();
  initHomeHeroAnimations();
  initImagePlaceholders();
  initViewSwitcher();
  initLabGallery();
}

async function loadNewPage(e, t = false) {
  try {
    const o = await fetch(e);
    if (!o.ok) throw new Error("Network response was not ok");
    const n = await o.text(),
      r = new DOMParser().parseFromString(n, "text/html"),
      i = () => {
        updateContent(r);
        // Scroll adapté selon la présence de smoother
        if (smoother) {
          smoother.scrollTo(0, false);
        } else {
          window.scrollTo(0, 0);
        }
      };

    if (t && document.startViewTransition) {
      const e = document.startViewTransition(i);
      await e.finished;
    } else i();

    initializeAllAnimations();
  } catch (e) {
    console.error("Error loading new page:", e);
  }
}

function updateContent(e) {
  const t = e.querySelector("#main-content"),
    o = document.querySelector("#main-content");
  t && o
    ? (o.innerHTML = t.innerHTML)
    : (document.body.innerHTML = e.body.innerHTML);

  document.title = e.title;
  resetWebflow();
  initVideoPlayer();
  initScrollSmoother();

  // Scroll to top adapté selon la présence de smoother
  if (smoother) {
    smoother.scrollTo(0, false);
  } else {
    window.scrollTo(0, 0);
  }

  highlightCurrentPageDot();
  initViewSwitcher();
}

let AppState = {};

// =========================================================================
// NOUVELLE FONCTION AJOUTÉE
// =========================================================================
function manageScrollTriggerState() {
  // Condition : est-ce un appareil tactile OU l'écran est-il plus petit que 1024px ?
  const isTouchDevice = navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 1024;

  if (isTouchDevice || isSmallScreen) {
    // Si la condition est vraie, on désactive tous les ScrollTriggers
    console.log(
      "ScrollTrigger désactivé pour les appareils tactiles / petits écrans."
    );
    ScrollTrigger.disable();
  } else {
    // Sinon, on s'assure qu'ils sont activés
    console.log("ScrollTrigger activé pour le bureau.");
    ScrollTrigger.enable();
  }
}

// =========================================================================
// FONCTION MODIFIÉE
// =========================================================================
// Fonction pour gérer le redimensionnement
function handleResize() {
  ajusterAttributsSelonEcran(); // <-- On ajuste les attributs
  manageScrollTriggerState();
  manageCardHoverAnimations();
  ScrollTrigger.refresh();
}

// Fonction principale d'initialisation
function initApp() {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    CustomEase,
    SplitText,
    DrawSVGPlugin,
    MorphSVGPlugin,
    Flip
  );

  // Appeler cette fonction AVANT d'initialiser les animations.
  // C'est crucial pour que les éléments aient le bon état de base.
  ajusterAttributsSelonEcran(); // <-- LIGNE AJOUTÉE ICI

  manageScrollTriggerState();

  AppState.menu = initMenu();
  initScrollSmoother();
  initVideoPlayer();
  highlightCurrentPageDot();
  initializeAllAnimations(); // Maintenant, les animations s'initialisent sur des éléments correctement configurés.

  window.addEventListener("resize", debounce(handleResize, 250));

  window.navigation &&
    navigation.addEventListener("navigate", (e) => {
      const t = new URL(e.destination.url);
      if (location.origin === t.origin && t.href !== location.href) {
        e.intercept({
          async handler() {
            if (AppState.menu.isMenuOpen) AppState.menu.closeMenu();
            await loadNewPage(t.href, true);
            // Après un changement de page, il faut aussi ré-appliquer la logique
            ajusterAttributsSelonEcran();
          },
        });
      }
    });

  window.addEventListener("error", (e) =>
    console.error("Uncaught error:", e.error)
  );
}

document.addEventListener("DOMContentLoaded", initApp);
