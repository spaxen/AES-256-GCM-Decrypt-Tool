// Utility helpers used across the app
const $ = id => document.getElementById(id);

function enableAutoSelect(el) {
  el.addEventListener("focus", () => {
    setTimeout(() => {
      if (el.tagName === "INPUT") {
        try { el.select(); } catch {}
      } else {
        const r = document.createRange();
        r.selectNodeContents(el);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
      }
    }, 10);
  });
}

const bytesToHex = b => [...b].map(x=>x.toString(16).padStart(2,"0")).join("");
const hexToBytes = h => {
  if (!/^[0-9a-fA-F]+$/.test(h) || h.length % 2 !== 0) throw new Error("Invalid HEX");
  return Uint8Array.from(h.match(/.{2}/g).map(b=>parseInt(b,16)));
};
