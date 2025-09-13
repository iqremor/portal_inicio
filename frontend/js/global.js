document.addEventListener("DOMContentLoaded", function() {
    // Cargar el CSS global
    const head = document.head;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/frontend/css/global.css";
    head.appendChild(link);

    // Crear contenedor para el footer si no existen
    if (!document.querySelector('#global-footer')) {
        const footerPlaceholder = document.createElement('div');
        footerPlaceholder.id = 'global-footer';
        document.body.appendChild(footerPlaceholder);
    }

    // Cargar y mostrar el footer
    fetch("/frontend/pages/footer.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector("#global-footer").innerHTML = data;
        });
});