(() => {
    const root = document.documentElement;
    const get = (key, fallback) => {
        try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
    };
    const systemTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.dataset.theme = get("portfolioAppearance", get("portfolio-theme", systemTheme));
    root.dataset.style = get("portfolioStyle", "editorial");
    root.dataset.color = get("portfolioColor", "monochrome");
})();
