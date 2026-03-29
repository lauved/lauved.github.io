(() => {
    const storageKey = "portfolio-theme";
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");
    const filterButtons = document.querySelectorAll(".filter-chip");
    const projectCards = document.querySelectorAll(".project-card");
    const homeFilterButtons = document.querySelectorAll(".home-filter-chip");
    const homeProjectCards = document.querySelectorAll(".home-project-card");
    const contactForms = document.querySelectorAll(".contact-form");
    const interactiveDotGrid = document.getElementById("interactiveDotGrid");
    const navSectionLinks = document.querySelectorAll('.nav__links a[href^="#"]');

    const initThemeToggle = () => {
        if (!themeToggle) {
            return;
        }

        const icon = themeToggle.querySelector(".theme-toggle__icon");
        const label = themeToggle.querySelector(".theme-toggle__text");

        const applyTheme = (theme) => {
            const isDark = theme === "dark";

            root.setAttribute("data-theme", theme);
            localStorage.setItem(storageKey, theme);
            themeToggle.setAttribute("aria-pressed", String(isDark));
            themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

            if (icon) {
                icon.innerHTML = isDark ? "&#9728;" : "&#9789;";
            }

            if (label) {
                label.textContent = isDark ? "Light" : "Dark";
            }
        };

        const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        applyTheme(currentTheme);

        themeToggle.addEventListener("click", () => {
            const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
        });
    };

    const initProjectFilters = () => {
        if (!filterButtons.length || !projectCards.length) {
            return;
        }

        const setFilter = (filter) => {
            filterButtons.forEach((button) => {
                const isActive = button.dataset.filter === filter;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });

            projectCards.forEach((card) => {
                const categories = (card.dataset.categories || "").split(" ").filter(Boolean);
                const shouldShow = filter === "all" || categories.includes(filter);
                card.hidden = !shouldShow;
            });
        };

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                setFilter(button.dataset.filter || "all");
            });
        });

        setFilter("all");
    };

    const initHomeProjectPreview = () => {
        if (!homeFilterButtons.length || !homeProjectCards.length) {
            return;
        }

        const setHomeFilter = (filter) => {
            homeFilterButtons.forEach((button) => {
                const isActive = button.dataset.homeFilter === filter;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });

            homeProjectCards.forEach((card) => {
                card.hidden = card.dataset.homePreview !== filter;
            });
        };

        homeFilterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                setHomeFilter(button.dataset.homeFilter || "all");
            });
        });

        setHomeFilter("all");
    };

    const initContactForms = () => {
        if (!contactForms.length) {
            return;
        }

        contactForms.forEach((form) => {
            form.addEventListener("submit", (event) => {
                event.preventDefault();

                const formData = new FormData(form);
                const name = String(formData.get("name") || "").trim();
                const email = String(formData.get("email") || "").trim();
                const message = String(formData.get("message") || "").trim();
                const recipient = form.getAttribute("data-contact-email") || "";

                if (!recipient) {
                    return;
                }

                const subject = encodeURIComponent(`Portfolio inquiry from ${name || "visitor"}`);
                const body = encodeURIComponent(
                    [
                        `Name: ${name}`,
                        `Email: ${email}`,
                        "",
                        "Message:",
                        message,
                    ].join("\n")
                );

                window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
            });
        });
    };

    const initNavScrollSpy = () => {
        if (!navSectionLinks.length) {
            return;
        }

        const nav = document.querySelector(".nav");
        const sections = Array.from(navSectionLinks)
            .map((link) => {
                const href = link.getAttribute("href") || "";
                const id = href.startsWith("#") ? href.slice(1) : "";
                const section = id ? document.getElementById(id) : null;

                if (!(section instanceof HTMLElement)) {
                    return null;
                }

                return { id, link, section };
            })
            .filter(Boolean);

        if (!sections.length) {
            return;
        }

        const setActiveLink = (activeId) => {
            sections.forEach(({ id, link }) => {
                if (id === activeId) {
                    link.setAttribute("aria-current", "page");
                    return;
                }

                link.removeAttribute("aria-current");
            });
        };

        const updateActiveLink = () => {
            const navOffset = nav instanceof HTMLElement ? nav.offsetHeight + 28 : 120;
            let activeId = sections[0].id;

            sections.forEach(({ id, section }) => {
                if (section.getBoundingClientRect().top - navOffset <= 0) {
                    activeId = id;
                }
            });

            setActiveLink(activeId);
        };

        updateActiveLink();
        window.addEventListener("scroll", updateActiveLink, { passive: true });
        window.addEventListener("resize", updateActiveLink);
        window.addEventListener("hashchange", updateActiveLink);
    };

    const initTextRevealHeadings = () => {
        const headings = document.querySelectorAll("[data-text-reveal]");

        if (!headings.length) {
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const splitNode = (node, wordIndexRef) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const fragment = document.createDocumentFragment();
                const parts = (node.textContent || "").split(/(\s+)/);

                parts.forEach((part) => {
                    if (!part) {
                        return;
                    }

                    if (/^\s+$/.test(part)) {
                        fragment.appendChild(document.createTextNode(part));
                        return;
                    }

                    const word = document.createElement("span");
                    word.className = "reveal-word";
                    word.style.setProperty("--word-index", String(wordIndexRef.value));
                    word.textContent = part;
                    fragment.appendChild(word);
                    wordIndexRef.value += 1;
                });

                return fragment;
            }

            if (!(node instanceof HTMLElement)) {
                return node.cloneNode(true);
            }

            const clone = node.cloneNode(false);

            Array.from(node.childNodes).forEach((child) => {
                clone.appendChild(splitNode(child, wordIndexRef));
            });

            return clone;
        };

        headings.forEach((heading) => {
            const wordIndexRef = { value: 0 };
            const fragment = document.createDocumentFragment();

            Array.from(heading.childNodes).forEach((child) => {
                fragment.appendChild(splitNode(child, wordIndexRef));
            });

            heading.replaceChildren(fragment);
        });

        if (prefersReducedMotion) {
            headings.forEach((heading) => {
                heading.classList.add("is-visible");
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("is-visible", entry.isIntersecting);
                });
            },
            {
                threshold: 0.35,
                rootMargin: "0px 0px -10% 0px",
            }
        );

        headings.forEach((heading) => {
            observer.observe(heading);
        });
    };

    const initInteractiveDotGrid = () => {
        if (!(interactiveDotGrid instanceof HTMLCanvasElement)) {
            return;
        }

        const context = interactiveDotGrid.getContext("2d");

        if (!context) {
            return;
        }

        const pointer = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2,
            intensity: 0,
            targetIntensity: 0,
        };

        const palette = {
            base: "156, 156, 156",
            active: "19, 19, 19",
        };

        let width = 0;
        let height = 0;
        let dpr = 1;
        let themeKey = "";

        const updatePalette = () => {
            const nextThemeKey = root.getAttribute("data-theme") || "light";

            if (themeKey === nextThemeKey) {
                return;
            }

            themeKey = nextThemeKey;

            const styles = getComputedStyle(root);
            palette.base = styles.getPropertyValue("--grid-dot-rgb").trim() || palette.base;
            palette.active = styles.getPropertyValue("--grid-dot-active-rgb").trim() || palette.active;
        };

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = Math.max(1, window.innerWidth);
            height = Math.max(1, window.innerHeight);

            interactiveDotGrid.width = Math.floor(width * dpr);
            interactiveDotGrid.height = Math.floor(height * dpr);
            interactiveDotGrid.style.width = `${width}px`;
            interactiveDotGrid.style.height = `${height}px`;

            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = () => {
            updatePalette();

            pointer.x += (pointer.targetX - pointer.x) * 0.16;
            pointer.y += (pointer.targetY - pointer.y) * 0.16;
            pointer.intensity += (pointer.targetIntensity - pointer.intensity) * 0.12;

            context.clearRect(0, 0, width, height);

            const spacing = 30;
            const baseRadius = width < 768 ? 1.55 : 1.85;
            const maxBoost = width < 768 ? 5.1 : 6.1;
            const influenceRadius = width < 768 ? 126 : 162;

            for (let y = spacing / 2; y <= height; y += spacing) {
                for (let x = spacing / 2; x <= width; x += spacing) {
                    let influence = 0;

                    if (pointer.intensity > 0.001) {
                        const distance = Math.hypot(x - pointer.x, y - pointer.y);

                        if (distance < influenceRadius) {
                            const falloff = 1 - distance / influenceRadius;
                            influence = falloff * falloff * pointer.intensity;
                        }
                    }

                    const radius = baseRadius + influence * maxBoost;
                    const alpha = 0.34 + influence * 0.66;

                    context.fillStyle = influence > 0.04
                        ? `rgba(${palette.active}, ${Math.min(alpha, 0.96)})`
                        : `rgba(${palette.base}, 0.42)`;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();

                    if (influence > 0.16) {
                        context.fillStyle = `rgba(${palette.active}, ${0.08 * influence})`;
                        context.beginPath();
                        context.arc(x, y, radius * 2.35, 0, Math.PI * 2);
                        context.fill();
                    }
                }
            }

            window.requestAnimationFrame(draw);
        };

        const onPointerMove = (event) => {
            if (event.pointerType === "touch") {
                return;
            }

            pointer.targetX = event.clientX;
            pointer.targetY = event.clientY;
            pointer.targetIntensity = 1;
        };

        const deactivatePointer = () => {
            pointer.targetIntensity = 0;
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerleave", deactivatePointer);
        window.addEventListener("resize", resize);

        resize();
        draw();
    };

    initThemeToggle();
    initNavScrollSpy();
    initTextRevealHeadings();
    initProjectFilters();
    initHomeProjectPreview();
    initContactForms();
    initInteractiveDotGrid();
})();
