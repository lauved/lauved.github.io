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
    const copyEmailButtons = document.querySelectorAll("[data-copy-email]");
    const currentYearTargets = document.querySelectorAll("[data-current-year]");
    const runnerSection = document.getElementById("home-game");
    const runnerCanvas = document.getElementById("runnerCanvas");
    const runnerScoreTarget = document.querySelector("[data-runner-score]");
    const runnerBestTarget = document.querySelector("[data-runner-best]");
    const runnerMessageTarget = document.querySelector("[data-runner-message]");
    const runnerActionButton = document.querySelector("[data-runner-action]");
    const runnerJumpButton = document.querySelector("[data-runner-jump]");

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

    initThemeToggle();
    initNavScrollSpy();
    initTextRevealHeadings();
    initProjectFilters();
    initHomeProjectPreview();
    initContactForms();
    initInteractiveDotGrid();
    initRunnerGame();
    initFooterUtilities();
})();
