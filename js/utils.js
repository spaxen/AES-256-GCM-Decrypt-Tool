// Utility helpers used across the app
const $ = id => document.getElementById(id);

const bytesToHex = b => [...b].map(x=>x.toString(16).padStart(2,"0")).join("");
const hexToBytes = h => {
  const trimmed = h.trim();
  if (!trimmed) throw new Error("HEX input is empty");
  if (!/^[0-9a-fA-F]+$/.test(trimmed)) throw new Error("Invalid HEX: only 0-9, a-f allowed");
  if (trimmed.length % 2 !== 0) throw new Error("Invalid HEX: must have even number of characters");
  return Uint8Array.from(trimmed.match(/.{2}/g).map(b=>parseInt(b,16)));
};
