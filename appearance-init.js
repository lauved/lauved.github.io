(() => {
    const root = document.documentElement;
    const get = (key, fallback) => {
        try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
    };
    const defaultTheme = "light";
    root.dataset.theme = get("portfolioAppearance", get("portfolio-theme", defaultTheme));
    root.dataset.style = get("portfolioStyle", "editorial");
    root.dataset.color = get("portfolioColor", "monochrome");
})();
