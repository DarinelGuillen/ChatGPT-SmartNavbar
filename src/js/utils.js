// utils.js

// Función para reemplazar el triggerKey y el texto posterior por la opción seleccionada
export function replaceTextInDiv(el, option, triggerKey) {
  const escapedTriggerKey = triggerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sel = window.getSelection();
  if (sel.rangeCount === 0) return;

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

// Función para esperar hasta que el elemento esté disponible
export function waitForElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  } else {
    requestAnimationFrame(() => waitForElement(selector, callback));
  }
}
