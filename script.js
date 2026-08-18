(() => {
    const root = document.documentElement;
    const filterButtons = document.querySelectorAll(".filter-chip");
    const projectCards = document.querySelectorAll(".project-card");
    const additionalProjectsList = document.querySelector(".additional-projects__links");
    const additionalProjectLinks = document.querySelectorAll(".additional-projects__links [data-categories]");
    const additionalProjectsEmpty = document.querySelector(".additional-projects__empty");
    const homeFilterButtons = document.querySelectorAll(".home-filter-chip");
    const homeProjectCards = document.querySelectorAll(".home-project-card");
    const contactForms = document.querySelectorAll(".contact-form");
    const interactiveDotGrid = document.getElementById("interactiveDotGrid");
    const navSectionLinks = document.querySelectorAll('.nav__links a[href^="#"]');
    const copyEmailButtons = document.querySelectorAll("[data-copy-email]");
    const currentYearTargets = document.querySelectorAll("[data-current-year]");
    const runnerSection = document.getElementById("home-game");
    const runnerCanvas = document.getElementById("runnerCanvas");
    const runnerScoreTarget = document.querySelector("[data-runner-score]");
    const runnerBestTarget = document.querySelector("[data-runner-best]");
    const runnerMessageTarget = document.querySelector("[data-runner-message]");
    const runnerActionButton = document.querySelector("[data-runner-action]");
    const runnerJumpButton = document.querySelector("[data-runner-jump]");

    document.querySelectorAll('a[href="works.html"]').forEach((link) => {
        if (link.textContent.trim() === "Works") link.textContent = "Projects";
    });
    document.querySelectorAll(".case-back").forEach((link) => {
        if (link.textContent.toLowerCase().includes("all works")) link.innerHTML = "&larr; Back to all projects";
    });

    const initAppearanceCustomizer = () => {
        const actions = document.querySelector(".nav__actions");
        if (!actions) return;

        const oldToggle = document.getElementById("themeToggle");
        let toggle = document.getElementById("appearanceToggle");
        if (!toggle && oldToggle) {
            toggle = oldToggle;
            toggle.id = "appearanceToggle";
            toggle.classList.add("appearance-toggle");
            toggle.setAttribute("aria-label", "Customize appearance");
            toggle.innerHTML = '<span class="theme-toggle__icon" aria-hidden="true">&#127912;</span><span class="theme-toggle__text">Appearance</span>';
        }
        if (!toggle) return;

        const styles = [
            ["editorial", "Editorial", "Clean editorial default", "✣"],
            ["art", "Art", "Expressive serif & curves", "◉"],
            ["modern", "Modern", "Bold, sharp, geometric", "◇"]
        ];
        const colors = [
            ["monochrome", "Monochrome"], ["blue", "Blue"], ["green", "Green"],
            ["red", "Red"], ["gold", "Gold / Orange"], ["pink", "Pink"], ["purple", "Purple"]
        ];
        const panel = document.createElement("div");
        panel.className = "appearance-panel";
        panel.id = "appearancePanel";
        panel.hidden = true;
        panel.innerHTML = `
            <div class="appearance-panel__heading"><span>Appearance</span><div class="appearance-modes" role="group" aria-label="Appearance"><button type="button" data-set-theme="light" aria-label="Light mode">☀</button><button type="button" data-set-theme="dark" aria-label="Dark mode">☾</button></div></div>
            <fieldset><legend>Style</legend><div class="style-options">${styles.map(([value, name, subtitle, icon]) => `<button type="button" data-set-style="${value}"><span aria-hidden="true">${icon}</span><span><strong>${name}</strong><small>${subtitle}</small></span></button>`).join("")}</div></fieldset>
            <fieldset><legend>Color</legend><div class="color-options">${colors.map(([value, name]) => `<button type="button" data-set-color="${value}" aria-label="${name}" title="${name}"><span></span></button>`).join("")}</div></fieldset>`;
        actions.appendChild(panel);
        toggle.setAttribute("aria-controls", panel.id);

        const save = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
        const updateHeroCopy = () => {
            const heading = document.querySelector(".hero--home .hero-text h1");
            if (!heading) return;
            heading.innerHTML = "UI/UX Designer<br>&amp; Front-End Developer.";
        };
        const sync = () => {
            panel.querySelectorAll("[data-set-theme]").forEach(el => el.classList.toggle("is-selected", el.dataset.setTheme === root.dataset.theme));
            panel.querySelectorAll("[data-set-style]").forEach(el => el.classList.toggle("is-selected", el.dataset.setStyle === root.dataset.style));
            panel.querySelectorAll("[data-set-color]").forEach(el => el.classList.toggle("is-selected", el.dataset.setColor === root.dataset.color));
            updateHeroCopy();
        };
        const setPanel = (open) => {
            panel.hidden = !open;
            toggle.setAttribute("aria-expanded", String(open));
            if (open) sync();
        };
        toggle.addEventListener("click", event => { event.stopPropagation(); setPanel(panel.hidden); });
        panel.addEventListener("click", event => {
            event.stopPropagation();
            const control = event.target.closest("button");
            if (!control) return;
            if (control.dataset.setTheme) { root.dataset.theme = control.dataset.setTheme; save("portfolioAppearance", control.dataset.setTheme); save("portfolio-theme", control.dataset.setTheme); }
            if (control.dataset.setStyle) { root.dataset.style = control.dataset.setStyle; save("portfolioStyle", control.dataset.setStyle); }
            if (control.dataset.setColor) { root.dataset.color = control.dataset.setColor; save("portfolioColor", control.dataset.setColor); }
            sync();
        });
        document.addEventListener("click", () => setPanel(false));
        document.addEventListener("keydown", event => { if (event.key === "Escape") { setPanel(false); toggle.focus(); } });
        sync();
    };

    const initProjectFilters = () => {
        if (!filterButtons.length || !projectCards.length) {
            return;
        }

        const filterAdditionalProjects = (filter) => {
            let visibleProjects = 0;

            additionalProjectLinks.forEach((project) => {
                const categories = (project.dataset.categories || "").split(" ").filter(Boolean);
                const shouldShow = filter === "all" || categories.includes(filter);
                project.hidden = !shouldShow;
                if (shouldShow) visibleProjects += 1;
            });

            if (additionalProjectsEmpty) {
                additionalProjectsEmpty.hidden = visibleProjects !== 0;
            }
        };

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

            if (additionalProjectsList) {
                additionalProjectsList.classList.add("is-filtering");
                filterAdditionalProjects(filter);
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        additionalProjectsList.classList.remove("is-filtering");
                    });
                });
            } else {
                filterAdditionalProjects(filter);
            }
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

        const validationRules = {
            name: (value) => !value ? "Name is required." : value.length > 100 ? "Name must be 100 characters or fewer." : "",
            email: (value) => !value ? "Email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Enter a valid email address." : "",
            subject: (value) => !value ? "Subject is required." : value.length > 150 ? "Subject must be 150 characters or fewer." : "",
            message: (value) => !value ? "Message is required." : value.length < 10 ? "Message must be at least 10 characters." : value.length > 5000 ? "Message must be 5000 characters or fewer." : ""
        };

        contactForms.forEach((form) => {
            const fields = Object.keys(validationRules).reduce((items, name) => {
                const input = form.elements.namedItem(name);
                if (input) items[name] = input;
                return items;
            }, {});
            const submitButton = form.querySelector(".contact-submit");
            const status = form.querySelector(".contact-form__status");
            let submitting = false;
            let submissionId = "";

            const showFieldError = (name, message) => {
                const input = fields[name];
                if (!input) return;
                const error = form.querySelector(`#${input.getAttribute("aria-describedby")}`);
                input.setAttribute("aria-invalid", String(Boolean(message)));
                if (error) error.textContent = message;
            };

            const validateField = (name) => {
                const value = String(fields[name]?.value || "").trim();
                const message = validationRules[name](value);
                showFieldError(name, message);
                return !message;
            };

            const validateForm = () => {
                let firstInvalid;
                Object.keys(fields).forEach((name) => {
                    if (!validateField(name) && !firstInvalid) firstInvalid = fields[name];
                });
                firstInvalid?.focus();
                return !firstInvalid;
            };

            Object.keys(fields).forEach((name) => {
                fields[name].addEventListener("blur", () => validateField(name));
                fields[name].addEventListener("input", () => {
                    if (fields[name].getAttribute("aria-invalid") === "true") validateField(name);
                });
            });

            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                if (submitting || !validateForm()) return;

                submitting = true;
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
                status.textContent = "";
                status.className = "contact-form__status";
                submissionId ||= crypto.randomUUID();

                const payload = Object.fromEntries(new FormData(form));
                Object.keys(fields).forEach(name => { payload[name] = String(payload[name] || "").trim(); });
                payload.submissionId = submissionId;

                try {
                    const response = await fetch(form.action, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json().catch(() => ({}));

                    if (!response.ok) {
                        if (result.fields) Object.entries(result.fields).forEach(([name, message]) => showFieldError(name, message));
                        throw new Error("Contact request failed");
                    }

                    form.reset();
                    Object.keys(fields).forEach(name => showFieldError(name, ""));
                    submissionId = "";
                    status.textContent = "Message sent successfully. I'll get back to you soon.";
                    status.classList.add("is-success");
                } catch (_) {
                    status.textContent = "Something went wrong. Please try again.";
                    status.classList.add("is-error");
                } finally {
                    submitting = false;
                    submitButton.disabled = false;
                    submitButton.textContent = "Send Message";
                }
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
            // Anchor targets stop below the sticky navigation because the sections
            // use scroll-margin-top. Include that breathing room in the activation
            // line so the clicked section, rather than the previous one, is active.
            const activationLine = navOffset + 48;
            let activeId = sections[0].id;

            sections.forEach(({ id, section }) => {
                if (section.getBoundingClientRect().top <= activationLine) {
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

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const pointer = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2,
            intensity: 0.72,
            targetIntensity: 0.72,
            active: false,
        };

        const palette = {
            glow: "255, 255, 255",
            smoke: "12, 12, 12",
            haze: "26, 26, 26",
        };

        const smokeTrail = [];
        const smokePuffs = [];
        let width = 0;
        let height = 0;
        let dpr = 1;
        let themeKey = "";
        let lastTime = performance.now();
        let trailTimer = 0;
        let smokeTimer = 0;

        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

        const updatePalette = () => {
            const nextThemeKey = root.getAttribute("data-theme") || "light";

            if (themeKey === nextThemeKey) {
                return;
            }

            themeKey = nextThemeKey;

            const styles = getComputedStyle(root);
            palette.glow = styles.getPropertyValue("--cursor-glow-rgb").trim() || palette.glow;
            palette.smoke = styles.getPropertyValue("--cursor-smoke-rgb").trim() || palette.smoke;
            palette.haze = styles.getPropertyValue("--cursor-haze-rgb").trim() || palette.haze;
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

        const addSmokeTrail = (radius) => {
            smokeTrail.unshift({
                x: pointer.x,
                y: pointer.y,
                radius,
                life: 1,
                drift: Math.random() * Math.PI * 2,
            });

            const maxTrailLength = width < 768 ? 8 : 12;

            if (smokeTrail.length > maxTrailLength) {
                smokeTrail.length = maxTrailLength;
            }
        };

        const addSmokePuffs = (speedFactor) => {
            const puffCount = prefersReducedMotion.matches ? 1 : speedFactor > 0.42 ? 2 : 1;
            const baseRadius = width < 768 ? 36 : 48;
            const variance = width < 768 ? 22 : 30;
            const spread = 14 + speedFactor * 18;

            for (let index = 0; index < puffCount; index += 1) {
                const angle = Math.random() * Math.PI * 2;
                const offset = Math.random() * spread;

                smokePuffs.push({
                    x: pointer.x + Math.cos(angle) * offset,
                    y: pointer.y + Math.sin(angle) * offset,
                    radius: baseRadius + Math.random() * variance,
                    life: 0,
                    ttl: 0.8 + Math.random() * 0.9,
                    vx: (Math.random() - 0.5) * (20 + speedFactor * 18),
                    vy: -6 + (Math.random() - 0.5) * 10,
                    wobble: Math.random() * Math.PI * 2,
                });
            }

            const maxPuffs = width < 768 ? 14 : 22;

            if (smokePuffs.length > maxPuffs) {
                smokePuffs.splice(0, smokePuffs.length - maxPuffs);
            }
        };

        const drawSoftCircle = (x, y, radius, color, alpha) => {
            if (alpha <= 0 || radius <= 0) {
                return;
            }

            const gradient = context.createRadialGradient(x, y, radius * 0.08, x, y, radius);
            gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
            gradient.addColorStop(0.45, `rgba(${color}, ${alpha * 0.45})`);
            gradient.addColorStop(1, `rgba(${color}, 0)`);

            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        };

        const draw = (time) => {
            updatePalette();

            const delta = Math.min((time - lastTime) / 1000, 0.05);
            lastTime = time;

            if (!pointer.active) {
                if (prefersReducedMotion.matches) {
                    pointer.targetX = width * 0.5;
                    pointer.targetY = height * 0.28;
                    pointer.targetIntensity = 0.34;
                } else {
                    pointer.targetX = width * 0.5 + Math.cos(time * 0.00032) * width * 0.14;
                    pointer.targetY = height * 0.28 + Math.sin(time * 0.00024) * height * 0.08;
                    pointer.targetIntensity = 0.44;
                }
            }

            const deltaX = pointer.targetX - pointer.x;
            const deltaY = pointer.targetY - pointer.y;
            const distance = Math.hypot(deltaX, deltaY);
            const speedFactor = clamp(distance / (width < 768 ? 78 : 110), 0, 1);

            pointer.x += deltaX * Math.min(1, delta * 7.2);
            pointer.y += deltaY * Math.min(1, delta * 7.2);
            pointer.intensity += (pointer.targetIntensity - pointer.intensity) * Math.min(1, delta * 5.2);

            context.clearRect(0, 0, width, height);

            const themeIsDark = themeKey === "dark";
            const glowRadius = (width < 768 ? 150 : 220) * (0.86 + pointer.intensity * 0.38);
            const glowHaloRadius = glowRadius * (themeIsDark ? 1.45 : 1.7);
            const glowCoreAlpha = themeIsDark
                ? 0.26 + pointer.intensity * 0.16
                : 0.44 + pointer.intensity * 0.18;
            const glowHaloAlpha = themeIsDark
                ? 0.12 + pointer.intensity * 0.08
                : 0.18 + pointer.intensity * 0.12;

            drawSoftCircle(pointer.x, pointer.y, glowHaloRadius, palette.glow, glowHaloAlpha);
            drawSoftCircle(pointer.x, pointer.y, glowRadius, palette.glow, glowCoreAlpha);
            drawSoftCircle(
                pointer.x + glowRadius * 0.12,
                pointer.y - glowRadius * 0.08,
                glowRadius * 0.54,
                palette.haze,
                themeIsDark ? 0.06 : 0.08
            );

            trailTimer += delta;
            smokeTimer += delta;

            const trailInterval = prefersReducedMotion.matches ? 0.11 : 0.05;
            const smokeInterval = prefersReducedMotion.matches ? 0.14 : Math.max(0.05, 0.11 - speedFactor * 0.05);

            if (trailTimer >= trailInterval && pointer.intensity > 0.08) {
                trailTimer = 0;
                addSmokeTrail((width < 768 ? 84 : 118) * (0.82 + pointer.intensity * 0.28));
            }

            if (smokeTimer >= smokeInterval && pointer.intensity > 0.14) {
                smokeTimer = 0;
                addSmokePuffs(speedFactor);
            }

            for (let index = smokeTrail.length - 1; index >= 0; index -= 1) {
                const plume = smokeTrail[index];
                plume.life -= delta * (prefersReducedMotion.matches ? 0.9 : 0.74);
                plume.radius += delta * (width < 768 ? 20 : 26);
                plume.x += Math.cos(plume.drift + time * 0.0011) * delta * 5;
                plume.y += Math.sin(plume.drift + time * 0.0009) * delta * 4 - delta * 10;

                if (plume.life <= 0) {
                    smokeTrail.splice(index, 1);
                    continue;
                }

                const trailAlpha = plume.life * (themeIsDark ? 0.11 : 0.16);
                drawSoftCircle(plume.x, plume.y, plume.radius, palette.smoke, trailAlpha);
                drawSoftCircle(plume.x, plume.y, plume.radius * 0.62, palette.glow, trailAlpha * 0.16);
            }

            for (let index = smokePuffs.length - 1; index >= 0; index -= 1) {
                const puff = smokePuffs[index];
                puff.life += delta;
                puff.radius += delta * (width < 768 ? 16 : 22);
                puff.x += puff.vx * delta + Math.cos(puff.wobble + time * 0.0016) * delta * 5;
                puff.y += puff.vy * delta - delta * 8;
                puff.vx *= 0.992;
                puff.vy *= 0.992;

                if (puff.life >= puff.ttl) {
                    smokePuffs.splice(index, 1);
                    continue;
                }

                const lifeProgress = 1 - puff.life / puff.ttl;
                const puffAlpha = lifeProgress * lifeProgress * (themeIsDark ? 0.12 : 0.18);

                drawSoftCircle(puff.x, puff.y, puff.radius, palette.smoke, puffAlpha);
            }

            window.requestAnimationFrame(draw);
        };

        const onPointerMove = (event) => {
            pointer.active = true;
            pointer.targetX = event.clientX;
            pointer.targetY = event.clientY;
            pointer.targetIntensity = 1;
        };

        const deactivatePointer = () => {
            pointer.active = false;
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerdown", onPointerMove, { passive: true });
        window.addEventListener("pointercancel", deactivatePointer);
        window.addEventListener("blur", deactivatePointer);
        document.documentElement.addEventListener("mouseleave", deactivatePointer);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                deactivatePointer();
            }
        });
        window.addEventListener("resize", resize);

        resize();
        window.requestAnimationFrame(draw);
    };

    const initRunnerGame = () => {
        if (!(runnerSection instanceof HTMLElement) || !(runnerCanvas instanceof HTMLCanvasElement)) {
            return;
        }

        const context = runnerCanvas.getContext("2d");

        if (!context) {
            return;
        }

        const bestScoreKey = "portfolio-runner-best";
        const state = {
            running: false,
            gameOver: false,
            score: 0,
            bestScore: 0,
            speed: 420,
            spawnTimer: 0.9,
            groundOffset: 0,
            theme: "",
            displayedScore: -1,
        };

        const palette = {
            skyTop: "#f7f1e8",
            skyBottom: "#ffffff",
            sun: "rgba(19, 19, 19, 0.08)",
            cloud: "rgba(19, 19, 19, 0.08)",
            groundFill: "#ebe3d7",
            groundLine: "#131313",
            runner: "#131313",
            runnerEye: "#fcfaf5",
            cactus: "#1f2c1d",
            cactusShade: "#31482d",
            overlay: "rgba(19, 19, 19, 0.72)",
            trail: "rgba(19, 19, 19, 0.18)",
            text: "#131313",
        };

        const runner = {
            x: 86,
            y: 0,
            width: 44,
            height: 48,
            velocityY: 0,
            grounded: true,
            legTimer: 0,
        };

        const clouds = Array.from({ length: 3 }, () => ({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            speed: 0,
        }));

        let obstacles = [];
        let width = 0;
        let height = 0;
        let dpr = 1;
        let lastFrameTime = 0;

        const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

        const getGroundY = () => height - Math.max(40, Math.round(height * 0.16));

        const readBestScore = () => {
            try {
                const value = Number.parseInt(localStorage.getItem(bestScoreKey) || "0", 10);
                return Number.isFinite(value) ? value : 0;
            } catch (error) {
                return 0;
            }
        };

        const writeBestScore = (value) => {
            try {
                localStorage.setItem(bestScoreKey, String(value));
            } catch (error) {
                // Ignore storage write failures and keep the game playable.
            }
        };

        const setMessage = (message) => {
            if (runnerMessageTarget instanceof HTMLElement) {
                runnerMessageTarget.textContent = message;
            }
        };

        const updateHud = (force = false) => {
            const nextScore = Math.floor(state.score);

            if (force || nextScore !== state.displayedScore) {
                state.displayedScore = nextScore;

                if (runnerScoreTarget instanceof HTMLElement) {
                    runnerScoreTarget.textContent = String(nextScore);
                }
            }

            if (runnerBestTarget instanceof HTMLElement) {
                runnerBestTarget.textContent = String(state.bestScore);
            }

            if (runnerActionButton instanceof HTMLButtonElement) {
                runnerActionButton.textContent = state.running || state.gameOver ? "Restart Game" : "Start Game";
            }
        };

        const resetCloud = (cloud, offset = 0) => {
            cloud.width = 46 + Math.random() * 44;
            cloud.height = 18 + Math.random() * 10;
            cloud.x = width + offset + Math.random() * 120;
            cloud.y = 28 + Math.random() * Math.max(40, height * 0.22);
            cloud.speed = 0.1 + Math.random() * 0.08;
        };

        const resetRunner = () => {
            runner.velocityY = 0;
            runner.grounded = true;
            runner.legTimer = 0;
            runner.y = getGroundY() - runner.height;
        };

        const resizeCanvas = () => {
            const rect = runnerCanvas.getBoundingClientRect();
            width = Math.max(320, Math.round(rect.width || 760));
            height = Math.max(220, Math.round(rect.height || 260));
            dpr = Math.min(window.devicePixelRatio || 1, 2);

            runnerCanvas.width = Math.round(width * dpr);
            runnerCanvas.height = Math.round(height * dpr);
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            clouds.forEach((cloud, index) => {
                resetCloud(cloud, index * (width / 3));
            });

            if (runner.grounded || runner.y === 0) {
                resetRunner();
            } else {
                runner.y = Math.min(runner.y, getGroundY() - runner.height);
            }
        };

        const updatePalette = () => {
            const theme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";

            if (theme === state.theme) {
                return;
            }

            state.theme = theme;

            if (theme === "dark") {
                Object.assign(palette, {
                    skyTop: "#151b26",
                    skyBottom: "#0d1118",
                    sun: "rgba(247, 241, 232, 0.08)",
                    cloud: "rgba(247, 241, 232, 0.12)",
                    groundFill: "#1c2432",
                    groundLine: "#f7f1e8",
                    runner: "#f7f1e8",
                    runnerEye: "#0d1118",
                    cactus: "#a9c893",
                    cactusShade: "#7ba56a",
                    overlay: "rgba(13, 17, 24, 0.72)",
                    trail: "rgba(247, 241, 232, 0.18)",
                    text: "#f7f1e8",
                });
                return;
            }

            Object.assign(palette, {
                skyTop: "#f7f1e8",
                skyBottom: "#ffffff",
                sun: "rgba(19, 19, 19, 0.08)",
                cloud: "rgba(19, 19, 19, 0.08)",
                groundFill: "#ebe3d7",
                groundLine: "#131313",
                runner: "#131313",
                runnerEye: "#fcfaf5",
                cactus: "#1f2c1d",
                cactusShade: "#31482d",
                overlay: "rgba(19, 19, 19, 0.72)",
                trail: "rgba(19, 19, 19, 0.18)",
                text: "#131313",
            });
        };

        const jumpRunner = () => {
            if (!runner.grounded) {
                return;
            }

            runner.grounded = false;
            runner.velocityY = -760;
        };

        const createObstacle = () => {
            const variant = Math.random() > 0.55 ? "tall" : "wide";

            return {
                x: width + 28,
                width: variant === "tall" ? 24 + Math.random() * 10 : 32 + Math.random() * 12,
                height: variant === "tall" ? 52 + Math.random() * 18 : 34 + Math.random() * 12,
                variant,
            };
        };

        const spawnObstacle = () => {
            obstacles.push(createObstacle());
        };

        const startGame = (jumpOnStart = false) => {
            state.running = true;
            state.gameOver = false;
            state.score = 0;
            state.speed = 420;
            state.spawnTimer = 0.82;
            state.groundOffset = 0;
            obstacles = [];
            resetRunner();
            setMessage("Jump over the cacti and keep the run alive.");
            updateHud(true);

            if (jumpOnStart) {
                jumpRunner();
            }
        };

        const finishGame = () => {
            state.running = false;
            state.gameOver = true;
            state.bestScore = Math.max(state.bestScore, Math.floor(state.score));
            writeBestScore(state.bestScore);
            setMessage("Game over. Press restart or jump to try again.");
            updateHud(true);
        };

        const triggerJump = () => {
            if (state.gameOver) {
                startGame(true);
                return;
            }

            if (!state.running) {
                startGame(true);
                return;
            }

            jumpRunner();
        };

        const isEditableElement = (element) => (
            element instanceof HTMLElement &&
            (element.matches("input, textarea, select, button, a") || element.isContentEditable)
        );

        const isSectionVisible = () => {
            const rect = runnerSection.getBoundingClientRect();
            return rect.bottom > 80 && rect.top < window.innerHeight - 40;
        };

        const rectanglesOverlap = (first, second) => (
            first.x < second.x + second.width &&
            first.x + first.width > second.x &&
            first.y < second.y + second.height &&
            first.y + first.height > second.y
        );

        const updateClouds = (deltaTime) => {
            clouds.forEach((cloud) => {
                cloud.x -= (state.running ? state.speed * cloud.speed : 14 + cloud.speed * 18) * deltaTime;

                if (cloud.x + cloud.width < -20) {
                    resetCloud(cloud);
                }
            });
        };

        const updateGame = (deltaTime) => {
            const groundY = getGroundY();
            const gravity = 2200;

            state.speed = clamp(state.speed + deltaTime * 8, 420, 720);
            state.spawnTimer -= deltaTime;
            state.groundOffset = (state.groundOffset + state.speed * deltaTime) % 34;
            state.score += deltaTime * (state.speed * 0.11);

            if (state.spawnTimer <= 0) {
                spawnObstacle();
                state.spawnTimer = clamp(1.18 - (state.speed - 420) / 520 + Math.random() * 0.45, 0.52, 1.4);
            }

            runner.velocityY += gravity * deltaTime;
            runner.y += runner.velocityY * deltaTime;

            const runnerGroundedY = groundY - runner.height;

            if (runner.y >= runnerGroundedY) {
                runner.y = runnerGroundedY;
                runner.velocityY = 0;
                runner.grounded = true;
            }

            if (runner.grounded) {
                runner.legTimer += deltaTime * 14;
            }

            obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -36);

            const runnerHitbox = {
                x: runner.x + 6,
                y: runner.y + 6,
                width: runner.width - 10,
                height: runner.height - 8,
            };

            for (const obstacle of obstacles) {
                obstacle.x -= state.speed * deltaTime;

                const obstacleHitbox = {
                    x: obstacle.x + 2,
                    y: groundY - obstacle.height + 2,
                    width: obstacle.width - 4,
                    height: obstacle.height - 2,
                };

                if (rectanglesOverlap(runnerHitbox, obstacleHitbox)) {
                    finishGame();
                    break;
                }
            }

            updateHud();
        };

        const drawCloud = (cloud) => {
            context.fillStyle = palette.cloud;
            context.beginPath();
            context.arc(cloud.x, cloud.y + 8, cloud.height * 0.55, Math.PI, 0);
            context.arc(cloud.x + cloud.width * 0.24, cloud.y, cloud.height * 0.7, Math.PI, 0);
            context.arc(cloud.x + cloud.width * 0.54, cloud.y + 6, cloud.height * 0.62, Math.PI, 0);
            context.closePath();
            context.fill();
        };

        const drawObstacle = (obstacle) => {
            const baseY = getGroundY();
            const obstacleX = obstacle.x;
            const obstacleY = baseY - obstacle.height;
            const stemWidth = obstacle.variant === "tall" ? obstacle.width * 0.46 : obstacle.width * 0.42;
            const stemX = obstacleX + (obstacle.width - stemWidth) / 2;

            context.fillStyle = palette.cactus;
            context.fillRect(stemX, obstacleY, stemWidth, obstacle.height);
            context.fillRect(obstacleX, obstacleY + obstacle.height * 0.46, obstacle.width * 0.22, 10);
            context.fillRect(obstacleX + obstacle.width * 0.78, obstacleY + obstacle.height * 0.24, obstacle.width * 0.18, 12);

            if (obstacle.variant === "wide") {
                context.fillRect(obstacleX + obstacle.width * 0.12, obstacleY + obstacle.height * 0.2, obstacle.width * 0.14, 12);
            }

            context.fillStyle = palette.cactusShade;
            context.fillRect(stemX + stemWidth * 0.6, obstacleY + 6, stemWidth * 0.14, obstacle.height - 10);
        };

        const drawRunner = () => {
            const x = runner.x;
            const y = runner.y;
            const legOffset = runner.grounded ? Math.max(0, Math.sin(runner.legTimer) * 6) : 3;
            const alternateLegOffset = runner.grounded ? Math.max(0, Math.sin(runner.legTimer + Math.PI) * 6) : 0;

            context.fillStyle = palette.runner;
            context.fillRect(x + 8, y + 14, 22, 18);
            context.fillRect(x + 24, y + 4, 16, 14);
            context.fillRect(x + 20, y + 14, 6, 8);
            context.fillRect(x + 2, y + 18, 10, 6);
            context.fillRect(x + 12, y + 32 - legOffset, 6, 14 + legOffset);
            context.fillRect(x + 23, y + 32 - alternateLegOffset, 6, 14 + alternateLegOffset);
            context.fillRect(x + 22, y + 20, 6, 5);

            context.fillStyle = palette.runnerEye;

            if (state.gameOver) {
                context.fillRect(x + 32, y + 8, 4, 2);
                context.fillRect(x + 33, y + 7, 2, 4);
                return;
            }

            context.fillRect(x + 33, y + 7, 3, 3);
        };

        const drawOverlay = () => {
            if (state.running) {
                return;
            }

            context.fillStyle = palette.overlay;
            context.fillRect(0, 0, width, height);
            context.fillStyle = "#ffffff";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "700 28px Inter, sans-serif";
            context.fillText(state.gameOver ? "Game Over" : "Press Space to Play", width / 2, height / 2 - 8);
            context.font = "500 15px Inter, sans-serif";
            context.fillText(
                state.gameOver ? "Restart the run and beat your best score." : "Jump with Space, Arrow Up, or tap.",
                width / 2,
                height / 2 + 26
            );
        };

        const drawScene = () => {
            updatePalette();

            const sky = context.createLinearGradient(0, 0, 0, height);
            sky.addColorStop(0, palette.skyTop);
            sky.addColorStop(1, palette.skyBottom);

            context.clearRect(0, 0, width, height);
            context.fillStyle = sky;
            context.fillRect(0, 0, width, height);

            context.fillStyle = palette.sun;
            context.beginPath();
            context.arc(width - 84, 52, 22, 0, Math.PI * 2);
            context.fill();

            clouds.forEach(drawCloud);

            const groundY = getGroundY();
            context.fillStyle = palette.groundFill;
            context.fillRect(0, groundY, width, height - groundY);
            context.fillStyle = palette.groundLine;
            context.fillRect(0, groundY, width, 3);

            for (let x = -state.groundOffset; x <= width + 34; x += 34) {
                context.fillStyle = palette.trail;
                context.fillRect(x, groundY + 12, 16, 3);
                context.fillRect(x + 12, groundY + 22, 10, 3);
            }

            obstacles.forEach(drawObstacle);
            drawRunner();
            drawOverlay();
        };

        const animate = (timestamp) => {
            if (!lastFrameTime) {
                lastFrameTime = timestamp;
            }

            const deltaTime = Math.min((timestamp - lastFrameTime) / 1000, 0.032);
            lastFrameTime = timestamp;

            updateClouds(deltaTime);

            if (state.running) {
                updateGame(deltaTime);
            }

            drawScene();
            window.requestAnimationFrame(animate);
        };

        state.bestScore = readBestScore();
        updateHud(true);
        setMessage("Press Start or jump to begin.");
        resizeCanvas();
        drawScene();

        runnerCanvas.addEventListener("pointerdown", () => {
            triggerJump();
        });

        if (runnerActionButton instanceof HTMLButtonElement) {
            runnerActionButton.addEventListener("click", () => {
                startGame(false);
            });
        }

        if (runnerJumpButton instanceof HTMLButtonElement) {
            runnerJumpButton.addEventListener("click", () => {
                triggerJump();
            });
        }

        window.addEventListener("keydown", (event) => {
            if (!["Space", "ArrowUp", "KeyW"].includes(event.code)) {
                return;
            }

            if (!isSectionVisible() || isEditableElement(document.activeElement) || event.repeat) {
                return;
            }

            event.preventDefault();
            triggerJump();
        });

        window.addEventListener("resize", resizeCanvas);
        document.addEventListener("visibilitychange", () => {
            lastFrameTime = performance.now();
        });

        window.requestAnimationFrame(animate);
    };

    const copyTextToClipboard = async (value) => {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(value);
            return;
        }

        const helper = document.createElement("textarea");
        helper.value = value;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        helper.style.pointerEvents = "none";
        document.body.appendChild(helper);
        helper.focus();
        helper.select();

        const didCopy = document.execCommand("copy");
        helper.remove();

        if (!didCopy) {
            throw new Error("Clipboard copy failed");
        }
    };

    const initFooterUtilities = () => {
        currentYearTargets.forEach((target) => {
            target.textContent = String(new Date().getFullYear());
        });

        if (!copyEmailButtons.length) {
            return;
        }

        copyEmailButtons.forEach((button) => {
            if (!(button instanceof HTMLButtonElement)) {
                return;
            }

            const defaultLabel = button.textContent.trim() || "Copy";
            let resetTimer = 0;

            button.addEventListener("click", async () => {
                const email = button.dataset.copyEmail || "";

                if (!email) {
                    return;
                }

                button.disabled = true;

                try {
                    await copyTextToClipboard(email);
                    button.textContent = "Copied";
                    button.classList.add("is-copied");
                } catch (error) {
                    button.textContent = "Try again";
                    button.classList.remove("is-copied");
                }

                window.clearTimeout(resetTimer);
                resetTimer = window.setTimeout(() => {
                    button.textContent = defaultLabel;
                    button.disabled = false;
                    button.classList.remove("is-copied");
                }, 1600);
            });
        });
    };

    initAppearanceCustomizer();
    initNavScrollSpy();
    initTextRevealHeadings();
    initProjectFilters();
    initHomeProjectPreview();
    initContactForms();
    initInteractiveDotGrid();
    initFooterUtilities();

    const loadLappai = () => {
        if (document.querySelector('script[data-lappai]')) return;
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = "lappai.css";
        document.head.appendChild(stylesheet);
        const chatScript = document.createElement("script");
        chatScript.src = "lappai.js";
        chatScript.dataset.lappai = "true";
        document.body.appendChild(chatScript);
    };
    loadLappai();
})();
