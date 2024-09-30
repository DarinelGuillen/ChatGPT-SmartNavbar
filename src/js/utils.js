

export function replaceTextInDiv(el, option, triggerKey) {
  const escapedTriggerKey = escapeRegExp(triggerKey);
  const sel = window.getSelection();
  if (sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const text = el.innerText;
  const regex = new RegExp(escapedTriggerKey + '.*$', 'i');
  const match = text.match(regex);

  if (match) {
    const before = text.substring(0, match.index);
    const after = text.substring(match.index + match[0].length);


    el.innerHTML = before + option.replace(/\n/g, '<br>') + '<br>' + after;


    el.focus();
    const newRange = document.createRange();


    const lastNode = el.lastChild;
    if (lastNode) {
      if (lastNode.nodeType === Node.TEXT_NODE) {
        const offset = lastNode.length;
        newRange.setStart(lastNode, offset);
      } else {

        newRange.setStartAfter(lastNode);
      }
      newRange.collapse(true);

      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }
}

export function waitForElement(selector) {
  return new Promise(resolve => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(mutations => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
