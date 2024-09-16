(async function() {
  // Define el patrón de activación
  const triggerKey = '<<'; // Cambia esto a '<<', '--', ',,', '..', etc.

  // Escapar caracteres especiales en el patrón para usarlo en expresiones regulares
  const escapedTriggerKey = triggerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Cargar opciones desde el JSON
  const response = await fetch(chrome.runtime.getURL('data/options.json'));
  const options = await response.json();

  // Función para reemplazar el triggerKey y el texto después por la opción seleccionada
  function replaceTextInDiv(el, option) {
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    // Obtener el texto completo del div
    let text = el.innerText;
    const regex = new RegExp(escapedTriggerKey + '\\S*$', 'i');
    const match = text.match(regex);

    if (match) {
      const before = text.substring(0, match.index);
      const after = text.substring(match.index + match[0].length);
      el.innerText = before + option + after;

      // Mover el cursor al final del texto insertado
      const newRange = document.createRange();
      newRange.setStart(el.firstChild, before.length + option.length);
      newRange.setEnd(el.firstChild, before.length + option.length);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }

  // Función para manejar la lógica una vez que el elemento está disponible
  function initializeExtension(div) {
    // Crear menú desplegable
    const dropdown = document.createElement('div');
    dropdown.id = 'custom-dropdown';
    dropdown.classList.add(
      'fixed',
      'bg-white',
      'border',
      'border-gray-300',
      'shadow-lg',
      'rounded-md',
      'z-50',
      'hidden',
      'max-h-60',
      'overflow-auto'
    );

    document.body.appendChild(dropdown);

    let currentOptions = [];
    let selectedIndex = -1; // Índice de la opción seleccionada

    function updateDropdown() {
      // Limpiar el menú
      dropdown.innerHTML = '';

      // Obtener el texto después del triggerKey
      const textContent = div.innerText;
      const regex = new RegExp(escapedTriggerKey + '(\\S*)$', 'i');
      const match = textContent.match(regex);

      if (!match) {
        // Si no hay triggerKey al final, ocultar el menú y salir
        dropdown.classList.add('hidden');
        selectedIndex = -1;
        return;
      }

      const searchText = match[1].toLowerCase();

      // Filtrar opciones basadas en el texto ingresado
      currentOptions = options.filter((item) =>
        item.id.toLowerCase().includes(searchText)
      );

      // Limitar el número de opciones a 10
      currentOptions = currentOptions.slice(0, 10);

      if (currentOptions.length > 0) {
        // Reiniciar el índice de selección
        selectedIndex = 0;

        currentOptions.forEach((item, index) => {
          const optionDiv = document.createElement('div');
          optionDiv.textContent = item.id;
          optionDiv.classList.add(
            'px-4',
            'py-2',
            'cursor-pointer',
            'text-gray-700',
            'hover:bg-gray-100'
          );

          // Añadir clase de selección si es la opción seleccionada
          if (index === selectedIndex) {
            optionDiv.classList.add('bg-gray-200');
          }

          optionDiv.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateDropdownSelection();
          });

          optionDiv.addEventListener('click', () => {
            // Reemplazar el triggerKey y el texto después por la opción seleccionada
            replaceTextInDiv(div, item.option);
            dropdown.classList.add('hidden');
          });
          dropdown.appendChild(optionDiv);
        });

        // Mostrar el menú desplegable encima del div de entrada
        dropdown.classList.remove('hidden');

        // Obtener la posición del div de entrada
        const divRect = div.getBoundingClientRect();

        // Obtener la altura del menú desplegable
        const dropdownHeight = dropdown.offsetHeight;

        // Posicionar el menú encima del div de entrada
        dropdown.style.left = `${divRect.left}px`;
        dropdown.style.top = `${divRect.top - dropdownHeight - 5}px`; // 5px encima del div de entrada
        dropdown.style.minWidth = '150px'; // Ancho mínimo del menú
        dropdown.style.zIndex = '1000'; // Asegurar que sobresalga sobre otros elementos

        updateDropdownSelection();
      } else {
        // Ocultar el menú si no hay opciones
        dropdown.classList.add('hidden');
        selectedIndex = -1;
      }
    }

    // Función para actualizar la selección visual en el menú
    function updateDropdownSelection() {
      const optionDivs = dropdown.querySelectorAll('div');
      optionDivs.forEach((optionDiv, index) => {
        if (index === selectedIndex) {
          optionDiv.classList.add('bg-gray-200');
        } else {
          optionDiv.classList.remove('bg-gray-200');
        }
      });
    }

    div.addEventListener('input', () => {
      updateDropdown();
    });

    // Mover el listener de 'keydown' al objeto 'document' en fase de captura
    document.addEventListener(
      'keydown',
      function (e) {
        if (dropdown.classList.contains('hidden')) {
          return; // No hacer nada si el menú está oculto
        }

        if (
          e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'Enter' ||
          e.key === 'Escape'
        ) {
          e.preventDefault();
          e.stopPropagation();

          if (e.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % currentOptions.length;
            updateDropdownSelection();
          } else if (e.key === 'ArrowUp') {
            selectedIndex =
              (selectedIndex - 1 + currentOptions.length) % currentOptions.length;
            updateDropdownSelection();
          } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && selectedIndex < currentOptions.length) {
              const selectedItem = currentOptions[selectedIndex];
              replaceTextInDiv(div, selectedItem.option);
              dropdown.classList.add('hidden');
            }
          } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
          }
        }
      },
      true // Utilizar fase de captura
    );

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== div) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // Función para esperar hasta que el elemento esté disponible
  function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
    } else {
      requestAnimationFrame(() => waitForElement(selector, callback));
    }
  }

  // Iniciar la espera por el elemento 'prompt-textarea'
  waitForElement('#prompt-textarea', (div) => {
    initializeExtension(div);
  });
})();
