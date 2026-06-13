// app.js
const button = document.getElementById("btnAccion");
const mensaje = document.getElementById("mensaje");

const campoNombre = document.getElementById("campoNombre");
const previewNombre = document.getElementById("previewNombre");

let elUsuarioClickeo = false;

console.log(button);
console.log(mensaje);

button.addEventListener("click", function () {
  elUsuarioClickeo = true;
  console.log("Click detectado");
  mensaje.textContent = "Gracias por hacer click! Interactuaste con el boton"; 
});

campoNombre.addEventListener("input", function () {
  const valor = campoNombre.value;

  if (valor.length >= 3) {
    previewNombre.textContent = valor;
  } else {
    previewNombre.textContent = "Persona con nombre invalido";
  }
});

const mensajeoriginal = mensaje.textContent;
button.addEventListener("mouseover", function () {
  if (!elUsuarioClickeo) {
    mensaje.textContent = "Estas pasando por arriba";
    console.log("El Usuario esta pasando por arriba");
  }
});

button.addEventListener("mouseout", function () {
  if (!elUsuarioClickeo) {
    mensaje.textContent = mensajeoriginal;
    console.log("El Usuario dejo de pasar el mouse por arriba");
  } 
});
