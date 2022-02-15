import { createPreviewElement } from "./preview.js";

createPreviewElement();

document.getElementById("search").addEventListener('submit', event => {
    event.preventDefault();
    const search = event.target.elements.q.value;
    if (search.startsWith('/')) {
        window.location.href = search;
    }
})