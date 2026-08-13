(() => {
    const STORAGE_KEY = "lappaiConversation";
    const greeting = "Hello! I'm LAPPAI, Terrence's personal portfolio assistant. Ask me anything about his skills, projects, tech stack, experience, or design work.";
    const suggestions = ["View Terrence's Projects", "What are his skills?", "Tell me about DermaScan", "Why hire Terrence?"];

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
        if (history.length === 1) {
            suggestions.forEach(text => {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = text;
                button.addEventListener("click", () => send(text));
                suggestionsElement.appendChild(button);
            });
        }
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
    const send = async (rawValue) => {
        const value = String(rawValue || "").trim();
        if (!value || isSending) return;
        const userMessage = { role: "user", content: value };
        history.push(userMessage);
        saveHistory();
        suggestionsElement.replaceChildren();
        appendMessage(userMessage);
        input.value = "";
        setSending(true);
        const typing = showTyping();
        try {
            const response = await fetch("/api/lappai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history.slice(-12) })
            });
            if (!response.ok) throw new Error("Request failed");
            const data = await response.json();
            if (typeof data.answer !== "string" || !data.answer.trim()) throw new Error("Invalid response");
            const assistantMessage = { role: "assistant", content: data.answer.trim() };
            history.push(assistantMessage);
            saveHistory();
            typing.remove();
            appendMessage(assistantMessage, navigationFor(value));
        } catch (_) {
            const errorMessage = { role: "assistant", content: "Sorry, LAPPAI is having trouble responding right now. Please try again." };
            history.push(errorMessage);
            saveHistory();
            typing.remove();
            appendMessage(errorMessage);
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
