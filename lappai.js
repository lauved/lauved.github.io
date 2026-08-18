(() => {
    const STORAGE_KEY = "lappaiConversation";
    const greeting = "Hello! I'm LAPPAI, Terrence's local portfolio assistant. I use predefined portfolio information rather than generative AI. Ask me about his skills, projects, tech stack, experience, or design work.";
    const suggestions = [
        "View Terrence's Projects",
        "What are his skills?",
        "What is his tech stack?",
        "What are his strongest frontend skills?",
        "What are his UI/UX skills?",
        "Tell me about DermaScan",
        "Tell me about BioTrack",
        "Tell me about LUNAS",
        "Tell me about ClarifAI",
        "What AI was used in DermaScan?",
        "What is Terrence studying?",
        "Why hire Terrence?",
        "View Terrence's resume",
        "How can I contact Terrence?"
    ];

    const shell = document.createElement("div");
    shell.className = "lappai";
    shell.innerHTML = `
        <button class="lappai__launcher" type="button" aria-label="Open LAPPAI portfolio assistant" aria-expanded="false" aria-controls="lappaiDialog">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.75h14v10.5H9.2L5 19.4V5.75Zm2 2v7.7l1.54-1.2H17v-6.5H7Z"/></svg>
        </button>
        <section class="lappai__window" id="lappaiDialog" role="dialog" aria-modal="false" aria-labelledby="lappaiTitle" aria-hidden="true">
            <header class="lappai__header">
                <div><strong id="lappaiTitle">LAPPAI</strong><span><i aria-hidden="true"></i>Online · Ready to help</span></div>
                <div class="lappai__header-actions"><button class="lappai__clear" type="button">Clear Chat</button><button class="lappai__close" type="button" aria-label="Close LAPPAI">×</button></div>
            </header>
            <div class="lappai__conversation" aria-live="polite" aria-relevant="additions"></div>
            <div class="lappai__suggestions" aria-label="Suggested questions"></div>
            <form class="lappai__form">
                <label class="sr-only" for="lappaiInput">Ask LAPPAI</label>
                <input id="lappaiInput" maxlength="2000" autocomplete="off" placeholder="Ask LAPPAI..." required />
                <button type="submit">Send</button>
            </form>
        </section>`;
    document.body.appendChild(shell);

    shell.querySelector(".lappai__header span").lastChild.textContent = "Local assistant · Predefined answers";

    const launcher = shell.querySelector(".lappai__launcher");
    const windowElement = shell.querySelector(".lappai__window");
    const closeButton = shell.querySelector(".lappai__close");
    const clearButton = shell.querySelector(".lappai__clear");
    const conversation = shell.querySelector(".lappai__conversation");
    const suggestionsElement = shell.querySelector(".lappai__suggestions");
    const form = shell.querySelector(".lappai__form");
    const input = shell.querySelector("#lappaiInput");
    const sendButton = form.querySelector("button");
    let isSending = false;

    const readHistory = () => {
        try {
            const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed.filter(item => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string").slice(-30) : [];
        } catch (_) { return []; }
    };
    let history = readHistory();
    if (!history.length) history = [{ role: "assistant", content: greeting }];

    const saveHistory = () => {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30))); } catch (_) {}
    };
    const scrollToLatest = () => { conversation.scrollTop = conversation.scrollHeight; };
    const navigationFor = (question) => {
        const value = question.toLowerCase();
        if (/project|work|portfolio/.test(value)) return { label: "View Projects →", href: location.pathname.endsWith("index.html") || location.pathname === "/" ? "#home-works" : "index.html#home-works" };
        if (/skill|tech|stack|capabilit/.test(value)) return { label: "View Skills →", href: location.pathname.endsWith("index.html") || location.pathname === "/" ? "#home-about" : "index.html#home-about" };
        if (/resume|cv/.test(value)) return { label: "View Resume →", href: "assets/resume.pdf", external: true };
        if (/contact|email|hire|reach/.test(value)) return { label: "Contact Terrence →", href: location.pathname.endsWith("index.html") || location.pathname === "/" ? "#home-contact" : "index.html#home-contact" };
        return null;
    };
    const appendMessage = (message, action = null) => {
        const wrapper = document.createElement("div");
        wrapper.className = `lappai__message lappai__message--${message.role}`;
        const bubble = document.createElement("div");
        bubble.className = "lappai__bubble";
        bubble.textContent = message.content;
        wrapper.appendChild(bubble);
        if (action && message.role === "assistant") {
            const link = document.createElement("a");
            link.className = "lappai__action";
            link.href = action.href;
            link.textContent = action.label;
            if (action.external) { link.target = "_blank"; link.rel = "noopener"; }
            link.addEventListener("click", () => setOpen(false));
            wrapper.appendChild(link);
        }
        conversation.appendChild(wrapper);
        scrollToLatest();
    };
    const render = () => {
        conversation.replaceChildren();
        history.forEach(appendMessage);
        suggestionsElement.replaceChildren();
        suggestions.forEach(text => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = text;
            button.addEventListener("click", () => send(text));
            suggestionsElement.appendChild(button);
        });
        scrollToLatest();
    };
    const setOpen = (open) => {
        shell.classList.toggle("is-open", open);
        launcher.setAttribute("aria-expanded", String(open));
        launcher.setAttribute("aria-label", open ? "Close LAPPAI portfolio assistant" : "Open LAPPAI portfolio assistant");
        windowElement.setAttribute("aria-hidden", String(!open));
        if (open) window.setTimeout(() => input.focus(), 180);
        else launcher.focus();
    };
    const setSending = (sending) => {
        isSending = sending;
        input.disabled = sending;
        sendButton.disabled = sending;
        clearButton.disabled = sending;
        suggestionsElement.querySelectorAll("button").forEach(button => { button.disabled = sending; });
    };
    const showTyping = () => {
        const element = document.createElement("div");
        element.className = "lappai__message lappai__message--assistant lappai__typing";
        element.setAttribute("role", "status");
        element.innerHTML = '<div class="lappai__bubble"><span>LAPPAI is typing</span><i></i><i></i><i></i></div>';
        conversation.appendChild(element);
        scrollToLatest();
        return element;
    };

    const normalizeQuestion = value => String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const hasAny = (value, terms) => terms.some(term => value.includes(term));

    const projectAnswers = [
        {
            terms: ["clarifai"],
            answer: "ClarifAI is an AI-powered data-insights and decision-support web platform for Kyro Core I.T. Solutions. Terrence worked as its Frontend Developer and UI/UX Designer, contributing to client requirements, user flows, interface decisions, analytics experiences, and frontend presentation."
        },
        {
            terms: ["sneakhub", "sneak hub"],
            answer: "SneakHub is a responsive footwear catalog built with HTML, CSS, and JavaScript. Terrence handled its UI/UX design and frontend development, including navigation, promotional areas, product cards, visual hierarchy, and responsive behavior."
        },
        {
            terms: ["petpal", "pet pal"],
            answer: "PetPal is an interactive 2D pixel-art mobile game where players adopt and care for a virtual pet through feeding, grooming, and play. Terrence designed its UI/UX, interaction flow, frontend presentation, and consistent pixel-art direction."
        },
        {
            terms: ["baskit"],
            answer: "Baskit is a mobile and web grocery-list and pickup experience. Terrence designed the customer journey, mobile and web concepts, frontend screens, reusable components, and collection-code interactions."
        },
        {
            terms: ["dermascan", "derma scan"],
            answer: "DermaScan is an AI-assisted healthcare mobile concept for analyzing skin images. Terrence was its UI/UX Designer and Front-End Developer, creating the capture, scanning, results, and consultation flows in Flutter and Dart. Its documented AI technology is a Convolutional Neural Network (CNN); no specific architecture or provider is listed."
        },
        {
            terms: ["echoes", "lighthouse"],
            answer: "Echoes of the Lighthouse is an open-world 3D exploration and puzzle game. As Game Artist, Terrence contributed visual concepts, 3D art, environmental presentation, landmarks, contrast, and navigation cues."
        },
        {
            terms: ["biotrack", "bio track"],
            answer: "BioTrack is a cross-platform healthcare monitoring system spanning Flutter mobile, Next.js/React web, and Electron desktop. Terrence designed and developed responsive patient and provider interfaces, structured health information, and supported frontend-to-API integration and cross-platform consistency."
        },
        {
            terms: ["lunas"],
            answer: "LUNAS is an AI-assisted urban infrastructure maintenance capstone for Dagupan City. Terrence served as System Analyst and UI/UX Designer, working on requirements, Flutter screens and navigation, Google Maps location selection, and the overall UI/UX direction."
        }
    ];

    const answerLocally = rawQuestion => {
        const question = normalizeQuestion(rawQuestion);
        const project = projectAnswers.find(item => hasAny(question, item.terms));
        if (project) return project.answer;

        if (hasAny(question, ["hello", "hi", "hey", "kumusta", "kamusta", "good morning", "good afternoon", "good evening"])) {
            return "Hi! I'm LAPPAI, Terrence's portfolio assistant. Ask me about his projects, skills, education, design work, resume, or contact details.";
        }
        if (hasAny(question, ["thank", "salamat", "thanks"])) {
            return "You're welcome! Ask me anything else about Terrence's portfolio.";
        }
        if (hasAny(question, ["who is terrence", "about terrence", "tell me about terrence", "sino si terrence", "profile"])) {
            return "Terrence Paras Lappay is a UI/UX Designer and Front-End Developer based in Pangasinan, Philippines. He creates accessible, responsive digital experiences across web, mobile, AI-assisted products, and games, and is open to OJT, internships, junior roles, freelance work, and collaborations.";
        }
        if (hasAny(question, ["all project", "projects", "project", "portfolio", "works", "ginawa"])) {
            return "Terrence's selected projects are ClarifAI, SneakHub, PetPal, Baskit, DermaScan, Echoes of the Lighthouse, BioTrack, and LUNAS. They cover web, mobile, healthcare, AI-assisted systems, e-commerce concepts, and games.";
        }
        if (hasAny(question, ["ui ux", "ui/ux", "design skill", "designer", "figma", "wireframe", "prototype"])) {
            return "Terrence's UI/UX skills include interface and experience design, wireframing, prototyping, user flows, responsive and mobile-first design, design systems, visual hierarchy, typography, accessibility, and human-centered design. He uses Figma for interface planning and design.";
        }
        if (hasAny(question, ["frontend", "front end", "coding", "web development", "html", "css", "javascript"])) {
            return "Terrence's strongest frontend skills include responsive web development, HTML, CSS, JavaScript, React, Next.js, component-based development, cross-browser compatibility, accessibility, and REST API integration. He also develops mobile interfaces with Flutter, Dart, Kotlin, and Jetpack Compose.";
        }
        if (hasAny(question, ["backend", "database", "server", "mysql", "mongodb", "postgresql", "django", "fastapi", "express", "php"])) {
            return "Terrence's documented backend and data technologies include Django, PHP, FastAPI, Express, MySQL, MongoDB, PostgreSQL, and REST API integration. His primary focus remains UI/UX and frontend implementation.";
        }
        if (hasAny(question, ["tech stack", "technology", "technologies", "tools", "software", "programming language", "stack"])) {
            return "Terrence works with HTML, CSS, JavaScript, React, Next.js, Flutter, Dart, Kotlin, Jetpack Compose, Django, PHP, FastAPI, Express, MySQL, MongoDB, and PostgreSQL. His tools include Figma, Git, GitHub, VS Code, Postman, AWS, Unity, and Blender.";
        }
        if (hasAny(question, ["skill", "strength", "capability", "kayang gawin", "marunong"])) {
            return "Terrence combines UI/UX design with frontend implementation. His strengths include responsive interfaces, prototyping, user flows, accessibility, component-based development, problem solving, collaboration, adaptability, attention to detail, and creative thinking.";
        }
        if (hasAny(question, ["study", "studying", "education", "school", "university", "course", "college", "student", "nag aaral"])) {
            return "Terrence is pursuing a Bachelor of Science in Information Technology at PHINMA University of Pangasinan. He began the program in 2023.";
        }
        if (hasAny(question, ["experience", "employment", "job history", "worked", "professional experience"])) {
            return "Terrence's portfolio documents project experience across LUNAS, BioTrack, DermaScan, and the ClarifAI client project. It does not list formal employment history or completed company roles beyond that documented client work.";
        }
        if (hasAny(question, ["why hire", "hire terrence", "good candidate", "why should", "recruit", "employ"])) {
            return "Terrence is a strong candidate for teams that need both interface thinking and practical frontend execution. He brings responsive design, accessibility awareness, prototyping, implementation skills, attention to detail, adaptability, and experience across web, mobile, AI-assisted, and healthcare projects.";
        }
        if (hasAny(question, ["available", "availability", "ojt", "intern", "junior", "freelance", "collaboration", "open for work"])) {
            return "Yes. Terrence is available for OJT opportunities, internships, junior roles, freelance work, and team collaborations.";
        }
        if (hasAny(question, ["contact", "email", "phone", "reach", "message", "linkedin", "github", "location", "where is", "taga saan"])) {
            return "Terrence is based in Pangasinan, Philippines. You can email him at terrencelappay2118@gmail.com, find him on LinkedIn, or view his work on GitHub. Use the Contact section for the quickest route.";
        }
        if (hasAny(question, ["resume", "cv", "curriculum vitae"])) {
            return "You can open Terrence's resume using the Resume button in the navigation or the link below.";
        }

        return "I can help with Terrence's projects, UI/UX and frontend skills, technologies, education, availability, resume, and contact details. Try asking about a specific project such as LUNAS, BioTrack, DermaScan, or ClarifAI.";
    };

    const send = async (rawValue) => {
        const value = String(rawValue || "").trim();
        if (!value || isSending) return;
        const userMessage = { role: "user", content: value };
        history.push(userMessage);
        saveHistory();
        appendMessage(userMessage);
        input.value = "";
        setSending(true);
        const typing = showTyping();
        try {
            await new Promise(resolve => window.setTimeout(resolve, 350));
            const answer = answerLocally(value);
            const assistantMessage = { role: "assistant", content: answer };
            history.push(assistantMessage);
            saveHistory();
            typing.remove();
            appendMessage(assistantMessage, navigationFor(value));
        } finally {
            setSending(false);
            input.focus();
        }
    };

    launcher.addEventListener("click", () => setOpen(!shell.classList.contains("is-open")));
    closeButton.addEventListener("click", () => setOpen(false));
    clearButton.addEventListener("click", () => {
        if (isSending) return;
        history = [{ role: "assistant", content: greeting }];
        saveHistory();
        render();
        input.focus();
    });
    form.addEventListener("submit", event => { event.preventDefault(); send(input.value); });
    windowElement.addEventListener("keydown", event => { if (event.key === "Escape") setOpen(false); });
    render();
})();
