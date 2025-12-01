document.addEventListener("DOMContentLoaded", () => {
    const slideList = document.getElementById("slide-list");
    const viewerContainer = document.getElementById("viewer-container");
    const slideFrame = document.getElementById("slide-frame");
    const closeViewer = document.getElementById("close-viewer");

    // Example: simulate fetching available slides
    const slides = [
        { id: "slide123", title: "Japanese Greetings" },
        { id: "slide456", title: "Kanji Basics" }
    ];

    slides.forEach(slide => {
        const btn = document.createElement("button");
        btn.textContent = slide.title;
        btn.addEventListener("click", () => {
            slideFrame.src = `/viewer/${slide.id}`;
            viewerContainer.style.display = "block";
            window.scrollTo(0, viewerContainer.offsetTop);
        });
        slideList.appendChild(btn);
    });

    closeViewer.addEventListener("click", () => {
        slideFrame.src = "";
        viewerContainer.style.display = "none";
    });
});
