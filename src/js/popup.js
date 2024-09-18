document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup cargado.');

  // Ejemplo: Añadir funcionalidad al botón
  const boton = document.getElementById('miBoton');
  boton.addEventListener('click', () => {
    alert('¡Botón clickeado!');
  });
});
