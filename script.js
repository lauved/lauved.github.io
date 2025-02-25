// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");

    // ✅ DARK MODE FUNCTIONALITY ✅
    const darkModeToggle = document.getElementById("darkModeToggle");
    const isDarkMode = localStorage.getItem("dark-mode") === "enabled";

    // Apply dark mode if previously enabled
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        darkModeToggle.innerText = "☀️"; // Switch to sun icon when active
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        // Save user preference
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("dark-mode", "enabled");
            darkModeToggle.innerText = "☀️"; // Sun icon for light mode
        } else {
            localStorage.setItem("dark-mode", "disabled");
            darkModeToggle.innerText = "🌙"; // Moon icon for dark mode
        }
    });

    console.log("Dark mode initialized:", isDarkMode);

    // ✅ MOBILE MENU FUNCTIONALITY ✅
    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");
    let isMenuOpen = false;

    if (menuButton) {
        menuButton.addEventListener("click", (e) => {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            mobileMenu.style.display = isMenuOpen ? "block" : "none";
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
        if (isMenuOpen && !menuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            isMenuOpen = false;
            mobileMenu.style.display = "none";
        }
    });

    // ✅ SMOOTH SCROLL FUNCTIONALITY ✅
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.log("Section not found:", sectionId);
            return;
        }

        console.log("Scrolling to section:", sectionId);

        // Close mobile menu if open
        if (isMenuOpen) {
            isMenuOpen = false;
            mobileMenu.style.display = "none";
        }

        // Scroll smoothly into view
        section.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    // ✅ FIX: Ensure navigation buttons work ✅
    document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const sectionId = button.getAttribute("data-section");
            scrollToSection(sectionId);
        });
    });

    // ✅ PROJECT TABS FUNCTIONALITY ✅
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab");

            console.log("Switching to tab:", tabId);

            // Remove active class from all buttons
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            // Hide all tab contents and show only the selected one
            tabContents.forEach((content) => content.classList.remove("active"));
            document.getElementById(tabId)?.classList.add("active");
        });
    });

    // ✅ FIX: Ensure "All" tab is active by default ✅
    document.querySelector('.tab-button[data-tab="all"]')?.classList.add("active");
    document.getElementById("all")?.classList.add("active");

    // ✅ UPDATE ACTIVE NAVIGATION ✅
    function updateActiveNavigation() {
        const sections = document.querySelectorAll("section[id]");
        const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

        const scrollPosition = window.scrollY + 100;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach((link) => {
                    const linkSection = link.getAttribute("data-section");
                    if (linkSection === sectionId) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                });
            }
        });
    }

    // Add scroll event listener for navigation highlighting
    window.addEventListener("scroll", updateActiveNavigation);

    // Initialize navigation state
    updateActiveNavigation();
});
