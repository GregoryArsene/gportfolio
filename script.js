// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
    const lenis = initLenis();
    const { openMenu, closeMenu } = initMenu(lenis);
    initBarba(lenis, closeMenu);
    initAnimations();
  
    window.addEventListener('popstate', () => setTimeout(initAnimations, 0));
  });
  
  // Lenis initialization
  function initLenis() {
    const lenis = new Lenis({
      lerp: 0.1,
      orientation: "vertical",
      wheelMultiplier: 1.3,
      smoothWheel: true,
    });
  
    requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    });
  
    return lenis;
  }
  
  // Menu initialization
  function initMenu(lenis) {
    const menu = document.querySelector(".menu");
    const menuTrigger = document.querySelector(".menu-trigger");
    const menuElements = {
      triggerText: document.querySelectorAll(".menu-trigger-text"),
      linkTitles: document.querySelectorAll(".menu-link-title"),
      primaryNavLetters: document.querySelectorAll(".primary-nav-letter"),
      social: document.querySelectorAll("[menu-social]")
    };
  
    let isMenuOpen = false;
    let animation = null;
  
    const customEase = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
  
    function animateMenu(open) {
      if (animation) animation.kill();
      
      animation = gsap.timeline();
  
      if (open) {
        animation
          .to(menu, { x: "0%", opacity: 1, duration: 0.8, ease: customEase })
          .to(menuElements.triggerText, { y: "-100%", duration: 0.4, ease: "power2.inOut" }, 0)
          .fromTo([...menuElements.linkTitles, ...menuElements.primaryNavLetters, ...menuElements.social], 
            { y: "150%" }, 
            { y: "0%", duration: 0.5, stagger: 0.05, ease: customEase }, 
            0.2
          );
      } else {
        animation
          .to(menu, { 
            opacity: 0, 
            duration: 0.2, 
            ease: "power2.inOut", 
            onComplete: () => gsap.set(menu, { x: "100%" }) 
          })
          .to(menuElements.triggerText, { y: "0%", duration: 0.3, ease: "power2.inOut" }, 0);
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
        e.preventDefault();
        const href = link.getAttribute("href");
        if (href) {
          closeMenu();
          setTimeout(() => barba.go(href), 100);
        }
      });
    });
  
    return { openMenu, closeMenu };
  }
  
  // Barba initialization
  function initBarba(lenis, closeMenu) {
    barba.hooks.before(() => lenis.stop());
    barba.hooks.after(() => {
      closeMenu();
      lenis.start();
    });
  
    barba.init({
      transitions: [{
        preventRunning: true,
        async leave() {
          await pageEnterAnimation().catch(console.error);
        },
        enter(data) {
          updateCurrentClass();
          const nextContainer = data.next.container;
          nextContainer.classList.add("fixed");
  
          resetWebflow(data);
  
          gsap.to(nextContainer, {
            onComplete: () => {
              nextContainer.classList.remove("fixed");
              window.scrollTo(0, 0);
              pageExitAnimation();
              initAnimations();
              initMediaControls();
            }
          });
        }
      }]
    });
  }
  
  barba.hooks.after((data) => {
    const video = document.getElementById('myVideo');
    if (video) {
      video.load();
      video.play();
    }
  });
  
  window.addEventListener('popstate', () => {
    barba.go(window.location.href);
  });
  
  // Animations initialization
  function initAnimations() {
    const customEase = CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1");
  
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
  
          gsap.fromTo(line, { y: animationProps.fromY }, {
            y: "0%",
            duration: animationProps.duration,
            ease: customEase,
            delay: animationProps.baseDelay + index * animationProps.staggerDelay,
            scrollTrigger: animationProps.scrollTrigger,
          });
        });
      });
    }
  
    initSplitText("[line-left]", { fromY: "300%", duration: 0.8, baseDelay: 0.5, staggerDelay: 0.1 });
    initSplitText("[lines]", { 
      fromY: "100%", 
      duration: 0.8, 
      baseDelay: 0.1, 
      staggerDelay: 0.06, 
      scrollTrigger: { 
        trigger: ".hero-project-img-container", 
        start: "bottom 70%", 
        once: true, 
        markers: true 
      } 
    });
  
    gsap.utils.toArray("[line-right]").forEach(element => {
      gsap.fromTo(element, { y: "100%" }, { y: "0%", duration: 0.8, ease: customEase, delay: 0.7 });
    });
  
    initMenuLinkOpacity();
    initProjectPageHero();
    initMediaControls();
  }
  
  // Menu link opacity animation
  function initMenuLinkOpacity() {
    document.querySelectorAll(".home-project-item").forEach((item) => {
      const tl = gsap.timeline({ paused: true });
      tl.to(item, { filter: "grayscale(100%)", duration: 0.3, ease: "power1.out" });
      item.addEventListener("mouseenter", () => tl.play());
      item.addEventListener("mouseleave", () => tl.reverse());
    });
  }
  
  // Project page hero animation
  function initProjectPageHero() {
    const projectHeroImg = document.querySelector(".project-hero-img");
    if (projectHeroImg) {
      gsap.timeline()
        .to(projectHeroImg, { 
          duration: 1.2, 
          scale: 1, 
          delay: 0.4, 
          ease: CustomEase.create("custom", "M0,0,C0.16,1,0.30,1,1,1") 
        })
        .to(projectHeroImg, { 
          y: "-8%", 
          scrollTrigger: { 
            trigger: projectHeroImg, 
            start: "top bottom", 
            end: "bottom top", 
            scrub: 0.1, 
            ease: "none"
          } 
        });
    }
  }
  
  // Media controls initialization
  function initMediaControls() {
    const video = document.getElementById('myVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timeRemaining = document.getElementById('timeRemaining');
  
    if (video && playPauseBtn && timeRemaining) {
      gsap.set([playPauseBtn, timeRemaining], { opacity: 0 });
  
      video.pause();
      playPauseBtn.textContent = 'Play';
  
      video.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          playPauseBtn.textContent = 'Pause';
        } else {
          video.pause();
          playPauseBtn.textContent = 'Play';
        }
      });
  
      video.addEventListener('timeupdate', () => {
        const timeLeft = video.duration - video.currentTime;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        timeRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      });
  
      video.addEventListener('mouseenter', () => {
        gsap.to([playPauseBtn, timeRemaining], { opacity: 1, duration: 0.2 });
      });
  
      video.addEventListener('mouseleave', () => {
        gsap.to([playPauseBtn, timeRemaining], { opacity: 0, duration: 0.2, delay: 0.5 });
      });
    }
  }
  
  // Page enter animation
  function pageEnterAnimation() {
    return gsap.timeline()
      .set(".page-transition", { display: "block" })
      .to(".page-transition", { 
        duration: 1, 
        y: "0%", 
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1") 
      })
      .fromTo(".page-content", 
        { y: "0vh" }, 
        { 
          duration: 1, 
          y: "-100vh", 
          ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1") 
        }, 
        "-=1"
      )
      .fromTo(".opacity-transition", 
        { opacity: 0, display: "block" }, 
        { opacity: 0.8, duration: 1, ease: "linear", display: "none" }, 
        "-=1"
      )
      .then(() => Promise.resolve());
  }
  
  // Page exit animation
  function pageExitAnimation() {
    return gsap.timeline()
      .set(".page-transition", { y: "0%" })
      .to(".page-transition", { 
        duration: 1, 
        y: "-100%", 
        ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1") 
      })
      .fromTo(".page-content", 
        { y: "50vh" }, 
        { 
          duration: 1, 
          y: "0vh", 
          ease: CustomEase.create("custom", "M0,0,C0.76,0,0.20,1,1,1") 
        }, 
        "-=1"
      )
      .to(".opacity-transition", { duration: 1, opacity: 0, ease: "linear" }, "-=1")
      .set(".page-transition", { display: "none", y: "100%" })
      .then(() => Promise.resolve());
  }
  
  // Update current class
  function updateCurrentClass() {
    document.querySelectorAll(".w-current").forEach(el => el.classList.remove("w--current"));
    document.querySelectorAll(".nav a").forEach(el => {
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
      initAnimations();
    }
  }