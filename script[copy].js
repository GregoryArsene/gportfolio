// GSAP & Plugins
// gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip);

// DÉFINITION DE LA CONDITION TACTILE MOBILE
const isTouchMobile =
  window.matchMedia("(max-width: 1023px)").matches &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

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

function initMenu() {
  const e = document.querySelector(".menu"),
    t = document.querySelector(".menu-trigger");
  if (!e || !t)
    return { openMenu: () => {}, closeMenu: () => {}, isMenuOpen: () => false };
  let o = !1;
  const n = {
      triggerText: document.querySelectorAll(".menu-trigger_text"),
      linkTitles: document.querySelectorAll(".primary-nav_title"),
      linkNumbers: document.querySelectorAll(".primary-nav_num"),
      social: document.querySelectorAll(".secondary-nav_title"),
      label: document.querySelectorAll(".menu-bottom_label"),
    },
    r = gsap
      .timeline({ paused: !0, defaults: { overwrite: "auto" } })
      .to(e, { x: "0%", opacity: 1, duration: 0.8, ease: EASES.customInOut })
      .to(
        n.triggerText,
        { y: "-100%", duration: 0.5, ease: EASES.menuLinkReveal },
        0
      )
      .fromTo(
        [...n.linkTitles, ...n.linkNumbers, ...n.social, ...n.label],
        { y: "200%" },
        { y: "0%", duration: 0.5, stagger: 0.05, ease: EASES.menuLinkReveal },
        0.2
      ),
    i = gsap
      .timeline({ paused: !0, defaults: { overwrite: "auto" } })
      .to(e, { opacity: 0, duration: 0.2, ease: "power2.inOut" })
      .to(n.triggerText, { y: "0%", duration: 0.3, ease: "power2.inOut" }, 0)
      .set(e, { x: "100%" }),
    a = () => {
      o ||
        ((o = !0),
        document.body.classList.add("menu-open"),
        r.restart(),
        e.setAttribute("aria-hidden", "false"),
        t.setAttribute("aria-expanded", "true"));
    },
    s = (n = !1) => {
      o &&
        ((o = !1),
        i.duration(n ? 0.25 : 0.2).restart(),
        document.body.classList.remove("menu-open"),
        e.setAttribute("aria-hidden", "true"),
        t.setAttribute("aria-expanded", "false"));
    };
  document.addEventListener("click", (n) => {
    t.contains(n.target)
      ? (n.stopPropagation(), o ? s() : a())
      : o && !e.contains(n.target) && s();
  });
  document.addEventListener("keydown", (e) => {
    "Escape" === e.key && o && s();
  });
  return { openMenu: a, closeMenu: s, isMenuOpen: () => o };
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
  let e = !1,
    t = null,
    o = !1;
  const n = document.getElementById("morphPath1"),
    r = document.getElementById("morphPath2"),
    i = document.getElementById("videoControls"),
    a = document.getElementById("videoControlsText"),
    s = document.getElementById("videoIndicator"),
    l = document.getElementById("videoTitle"),
    c = document.getElementById("videoDuration"),
    u = document.getElementById("VideoIdTop"),
    d = document.getElementById("VideoIdBtm"),
    m = document.querySelector("video");
  function p(e) {
    const t = Math.floor(e / 60),
      o = Math.floor(e % 60);
    return `${t.toString().padStart(2, "0")}:${o.toString().padStart(2, "0")}`;
  }
  function g() {
    o ||
      (l && gsap.to(l, { duration: 0.5, opacity: 0, ease: "power2.out" }),
      c && gsap.to(c, { duration: 0.5, opacity: 0, ease: "power2.out" }));
  }
  function h() {
    l && gsap.to(l, { duration: 0.5, opacity: 1, ease: "power2.out" }),
      c && gsap.to(c, { duration: 0.5, opacity: 1, ease: "power2.out" });
  }
  function y() {
    if (o) return;
    [u, d, i].forEach((e) => {
      e && gsap.to(e, { duration: 0.5, opacity: 0, ease: "power2.out" });
    });
  }
  function f() {
    [u, d, i].forEach((e) => {
      e && gsap.to(e, { duration: 0.5, opacity: 1, ease: "power2.out" });
    });
  }
  const v = {
      path1: "5 2.5 5 12 5 21.5 5 21.5 21 12 5 2.5 5 2.5",
      path2: "11.7 6.5 11.7 17.5 18.1 13.7 21 12 13.7 7.7 11.7 6.5",
    },
    w = {
      path1: "5 2.5 5 12 5 21.5 8.3 21.5 8.3 2.5 5 2.5 5 2.5",
      path2: "15 2.5 15 21.5 18.3 21.5 18.3 12 18.3 2.5 15 2.5",
    };
  function S() {
    gsap.to(n, {
      duration: 0.5,
      attr: { points: v.path1 },
      ease: "power2.inOut",
    }),
      gsap.to(r, {
        duration: 0.3,
        attr: { points: v.path2 },
        ease: "power2.inOut",
      }),
      (e = !1),
      a && (a.textContent = "PLAY"),
      s && (s.style.borderBottomColor = ""),
      t && (clearTimeout(t), (t = null)),
      h(),
      f();
  }
  function E() {
    gsap.to(n, {
      duration: 0.5,
      attr: { points: w.path1 },
      ease: "power2.inOut",
    }),
      gsap.to(r, {
        duration: 0.5,
        attr: { points: w.path2 },
        ease: "power2.inOut",
      }),
      (e = !0),
      a && (a.textContent = "PAUSE"),
      s && (s.style.borderBottomColor = "red"),
      (t = setTimeout(() => {
        g(), y();
      }, 3e3));
  }
  function A() {
    e
      ? (S(), m && m.pause())
      : (E(),
        m &&
          m.play().catch((e) => {
            console.error("Erreur lors de la lecture de la vidéo:", e);
          }));
  }
  return (
    m && m.addEventListener("click", A),
    n &&
      r &&
      (n.setAttribute("points", v.path1), r.setAttribute("points", v.path2)),
    a && (a.textContent = "PLAY"),
    m &&
      c &&
      (m.duration
        ? (c.textContent = p(m.duration))
        : m.addEventListener("loadedmetadata", () => {
            c.textContent = p(m.duration);
          }),
      m.addEventListener("timeupdate", function () {
        if (m && c) {
          const e = m.duration - m.currentTime;
          c.textContent = p(e);
        }
      })),
    m &&
      (m.addEventListener("mouseenter", () => {
        (o = !0), h(), f();
      }),
      m.addEventListener("mouseleave", () => {
        (o = !1),
          e &&
            (t && clearTimeout(t),
            (t = setTimeout(() => {
              g(), y();
            }, 3e3)));
      })),
    m &&
      (m.addEventListener("play", () => {
        e || E();
      }),
      m.addEventListener("pause", () => {
        e && S();
      })),
    { play: E, pause: S, toggle: A, isPlaying: () => e }
  );
}

function highlightCurrentPageDot() {
  const e =
    window.location.pathname.split("/").pop().replace(".html", "") ||
    "home_page_no_dot";
  document
    .querySelectorAll(".header-item_dot")
    .forEach((e) => e.classList.remove("active-dot"));
  if (["projects", "about", "lab"].includes(e)) {
    const t = document.getElementById(`${e}-dot`);
    t?.classList.add("active-dot");
  }
}

function initHeaderAnimation() {
  const e = document.querySelector(".header-logo"),
    t = gsap.utils.toArray(".header_list-item");
  if (!e && 0 === t.length) return;
  gsap.set([e, ...t], { clearProps: "all" });
  gsap.set(e, { y: "300%" });
  gsap.set(t, { y: "100%" });
  const o = gsap.timeline({
    defaults: { overwrite: "auto", ease: EASES.reveal },
  });
  o.to(e, { y: "0%", duration: 0.5 });
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
  const e = document.querySelector(".btn-view-grid"),
    t = document.querySelector(".btn-view-index"),
    o = document.querySelector(".work-grid"),
    n = document.querySelector(".work-index"),
    r = document.querySelector(".work-views-container");
  if (!e || !t || !o || !n || !r) return;
  const i = [e, t];
  e.classList.add("is-active");
  const a = (e, t) => {
    const o = t.offsetHeight;
    gsap.set(e, { position: "relative", visibility: "hidden", opacity: 1 });
    const n = e.offsetHeight;
    gsap.set(e, { position: "absolute", visibility: "hidden", opacity: 0 });
    gsap.set(r, { height: o });
    gsap.set(t, { position: "absolute" });
    gsap.set(e, { position: "absolute" });
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(e, {
            position: "relative",
            clearProps: "height,width,top,left",
          });
          gsap.set(r, { clearProps: "height" });
          gsap.set(t, { visibility: "hidden" });
          ScrollTrigger.refresh();
        },
      })
      .to(r, { height: n, duration: 0.4, ease: "power2.inOut" })
      .to(t, { opacity: 0, duration: 0.3 }, 0)
      .to(e, { opacity: 1, visibility: "visible", duration: 0.3 }, 0.1);
  };
  i.forEach((t) => {
    t.addEventListener("click", () => {
      if (!t.classList.contains("is-active")) {
        i.forEach((e) => e.classList.remove("is-active"));
        t.classList.add("is-active");
        if (t === e) a(o, n);
        else a(n, o);
      }
    });
  });
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
    oldContent.innerHTML = newContent.innerHTML;
  } else {
    document.body.innerHTML = doc.body.innerHTML;
  }
  document.title = doc.title;
  resetWebflow();
  AppState.menu = initMenu();
  initVideoPlayer();
  initScrollSmoother();
  smoother ? smoother.scrollTo(0, false) : window.scrollTo(0, 0);
  highlightCurrentPageDot();
}

let AppState = {};

function handleResize() {
  manageCardHoverAnimations();
  if (window.innerWidth > 568 && AppState.menu?.isMenuOpen()) {
    AppState.menu.closeMenu(true);
  }
  ScrollTrigger.refresh();
}

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
  AppState.menu = initMenu();
  initScrollSmoother();
  initVideoPlayer();
  highlightCurrentPageDot();
  initializePageSetup();

  window.addEventListener("resize", debounce(handleResize, 250));

  window.navigation?.addEventListener("navigate", (e) => {
    const destinationUrl = new URL(e.destination.url);
    if (
      location.origin === destinationUrl.origin &&
      destinationUrl.href !== location.href
    ) {
      e.intercept({
        async handler() {
          if (AppState.menu?.isMenuOpen()) {
            AppState.menu.closeMenu();
          }
          await loadNewPage(destinationUrl.href, true);
        },
      });
    }
  });
  window.addEventListener("error", (e) =>
    console.error("Uncaught error:", e.error)
  );
}

document.addEventListener("DOMContentLoaded", initApp);
