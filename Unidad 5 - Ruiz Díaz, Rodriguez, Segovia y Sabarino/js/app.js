const boton = document.getElementById("cambiar-imagen");

let imagenIndex = 2; // Empezamos en 2 xq la imagen 1 es la que ya está de fondo inicialmente
boton.addEventListener("click", (e) => {
    document.body.style.setProperty(
        "--bg-image",
        `url("../img/backgrounds/${imagenIndex}.jpg")`
    );

    imagenIndex %= 4;        
    imagenIndex += 1;
});