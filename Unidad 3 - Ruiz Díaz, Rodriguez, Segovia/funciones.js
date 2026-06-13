// Punto 2
function mostrarMensajeBienvenida() {
	console.log("Bienvenido.");
}
function mostrarMensajeSaludoTarde() {
	console.log("Hola, Buenas Tardes.");
}

mostrarMensajeBienvenida();
mostrarMensajeBienvenida();
mostrarMensajeSaludoTarde();
mostrarMensajeSaludoTarde();


// Punto 3
function mostrarMensajeBienvenidaUser(Nombre) {
	console.log("Bienvenido " + Nombre);
}

mostrarMensajeBienvenidaUser("Dante");
mostrarMensajeBienvenidaUser("Mati");
mostrarMensajeBienvenidaUser("Lucas");


// Punto 4
function Convert_KM2M(Numero) {
	return Numero * 1000;
}

const KM_EN_M = Convert_KM2M(3);
console.log(KM_EN_M);


// Punto 5
function mostrarMensajeBienvenidaContadorPollos() {
    console.log("Bienvenido al contador de pollos y gallinas");
}

function Cantidaddepollos(Cantdepollos, Cantdegallinas) {
    mostrarMensajeBienvenidaContadorPollos();

    if (Cantdegallinas) {
        console.log("Hay pollos y gallinas");
        if (Cantdepollos <= 3) {
            console.log("Hay " + Cantdepollos + " pollos y " + Cantdegallinas + " gallinas");
        } else {
            console.log("La cantidad de pollos multiplicado por diez es igual a: " + (Cantdepollos * 10));
        }

        if ((Cantdepollos === 10)) {
            return 2;
        }

        console.log("Entonces hay " + Cantdepollos + " pollos");
        return 1;
    } else {
        console.warn("No hay gallinas, solo pollos");
        return 0;
    }

}

console.log("- Primer Resultado: " + Cantidaddepollos(1));
console.log("- Segundo Resultado: " + Cantidaddepollos(2, 123));
console.log("- Tercer Resultado: " + Cantidaddepollos(5, 1));
console.log("- Cuarto Resultado: " + Cantidaddepollos(10, 8)); 
