(() => {
    const projects = [
        {
            id: "clarifai",
            title: "ClarifAI",
            url: "clarifai.html",
            categories: ["web", "ai"],
            categoryLabel: "Web / AI",
            role: "FRONTEND DEVELOPER / UI/UX DESIGNER",
            summary: "An AI-powered data insights and decision-support platform that turns uploaded datasets into natural-language answers, visualizations, forecasts, and actionable recommendations.",
            tags: ["Client-Based", "Web", "AI", "Analytics"],
            image: "assets/clarifaiweb.png",
            imageAlt: "ClarifAI analytics dashboard",
            client: "Client project for Kyro Core I.T. Solutions"
        },
        {
            id: "sneakhub",
            title: "SneakHub",
            url: "sneakhub.html",
            categories: ["web"],
            categoryLabel: "Web",
            role: "UI/UX DESIGN / FRONTEND DEVELOPER",
            summary: "A responsive footwear catalog with clear navigation, product-focused layouts, and a strong retail identity.",
            tags: ["Web", "Catalog", "UI/UX"],
            image: "assets/sneakhubsample.png",
            imageAlt: "SneakHub responsive footwear catalog",
            additional: true
        },
        {
            id: "petpal",
            title: "PetPal",
            url: "petpal.html",
            categories: ["mobile", "games"],
            categoryLabel: "Mobile / Games",
            role: "UI/UX DESIGN / FRONTEND DEVELOPER",
            summary: "An interactive 2D pixel-art mobile game where players adopt and care for a virtual pet through feeding, grooming, and play.",
            tags: ["Mobile", "Games", "8-Bit"],
            image: "assets/petpalsample.png",
            imageAlt: "PetPal virtual pet care gameplay",
            additional: true
        },
        {
            id: "baskit",
            title: "Baskit",
            url: "baskit.html",
            categories: ["mobile", "web"],
            categoryLabel: "Mobile / Web",
            role: "UI/UX DESIGN / FRONTEND DEVELOPER",
            summary: "A mobile and web grocery-list and pickup experience designed to save customers time while supporting fresh local-market shopping.",
            tags: ["Mobile", "Web", "Marketplace"],
            image: "assets/baskitfront.png",
            imageAlt: "Baskit mobile and web marketplace",
            additional: true
        },
        {
            id: "dermascan",
            title: "DermaScan",
            url: "dermascan.html",
            categories: ["mobile", "ai"],
            categoryLabel: "Mobile / AI",
            role: "UI/UX DESIGN / FRONTEND DEVELOPER",
            summary: "An AI-assisted mobile healthcare concept that guides users from skin-image capture to clear, responsible feedback.",
            tags: ["Mobile", "AI", "Healthcare"],
            image: "assets/derma3-front.png",
            imageAlt: "DermaScan skin analyzer interface"
        },
        {
            id: "echoes",
            title: "Echoes of the Lighthouse",
            url: "echoes.html",
            categories: ["games"],
            categoryLabel: "Games",
            role: "GAME ARTIST",
            summary: "A 3D exploration and puzzle game combining atmospheric storytelling, sound-guided play, and stylized visual world-building.",
            tags: ["Games", "3D", "Puzzle"],
            image: "assets/echoesfront.png",
            imageAlt: "Echoes of the Lighthouse title screen"
        },
        {
            id: "biotrack",
            title: "BioTrack",
            url: "biotrack.html",
            categories: ["mobile", "web", "ai"],
            categoryLabel: "Mobile / Web / AI",
            role: "UI/UX DESIGN / FRONTEND DEVELOPER",
            summary: "A cross-platform healthcare system for vital monitoring, provider workflows, AI-assisted insights, and blockchain-backed record verification.",
            tags: ["Mobile", "Web", "AI", "Healthcare"],
            image: "assets/biotrackweb.png",
            imageAlt: "BioTrack secure web experience"
        },
        {
            id: "lunas",
            title: "LUNAS",
            url: "lunas.html",
            categories: ["mobile", "web", "ai"],
            categoryLabel: "Mobile / Web / AI",
            role: "SYSTEM ANALYST / UI/UX DESIGNER",
            summary: "An AI-assisted urban infrastructure system connecting citizen reports, repair work, verification, and government monitoring.",
            tags: ["Mobile", "Web", "AI", "Civic Tech"],
            image: null,
            imageAlt: ""
        }
    ];

    window.portfolioProjects = Object.freeze(projects.map(project => Object.freeze(project)));
})();
