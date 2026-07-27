// Mirrors the textarea's text into an invisible div with identical styling
// to measure where the caret would land — textareas have no native API
// for this, so this is the standard workaround.
const MIRRORED_PROPERTIES = [
  "boxSizing", "width", "height", "overflowX", "overflowY",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderStyle",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize", "fontFamily",
  "lineHeight", "textAlign", "textTransform", "textIndent", "letterSpacing", "wordSpacing",
  "tabSize",
] as const;

export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

export function getCaretCoordinates(el: HTMLTextAreaElement, position: number): CaretCoordinates {
  const mirror = document.createElement("div");
  const computed = window.getComputedStyle(el);

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.width = computed.width;

  MIRRORED_PROPERTIES.forEach((prop) => {
    mirror.style[prop] = computed[prop];
  });

  document.body.appendChild(mirror);

  mirror.textContent = el.value.substring(0, position);
  const marker = document.createElement("span");
  marker.textContent = el.value.substring(position) || ".";
  mirror.appendChild(marker);

  const coords: CaretCoordinates = {
    top: marker.offsetTop + parseInt(computed.borderTopWidth || "0", 10) - el.scrollTop,
    left: marker.offsetLeft + parseInt(computed.borderLeftWidth || "0", 10) - el.scrollLeft,
    height: parseInt(computed.lineHeight || "0", 10) || marker.offsetHeight,
  };

  document.body.removeChild(mirror);
  return coords;
}