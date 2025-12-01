document.addEventListener("DOMContentLoaded", () => {
    const iframe = document.getElementById("slide-frame");
    const backBtn = document.getElementById("back-dashboard");

    // Extract slide ID from URL query parameter e.g., viewer.html?slideId=slide123
    const params = new URLSearchParams(window.location.search);
    const slideId = params.get("slideId");
    if (slideId) {
        iframe.src = `/viewer/${slideId}`;
    } else {
        iframe.src = '';
        alert("No slide selected.");
    }

    backBtn.addEventListener("click", () => {
        window.location.href = "/dashboard";
    });
});
