async function importKey(hex){
  const raw = hexToBytes(hex);
  if(raw.length !== 32) throw new Error("Key must be exactly 32 bytes (64 hex characters). Got " + hex.length + " characters.");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt","decrypt"]);
}

async function encrypt(pt, keyHex, ivHex){
  const key = await importKey(keyHex);
  const iv = hexToBytes(ivHex);
  if(iv.length !== 12) throw new Error("IV must be exactly 12 bytes (24 hex characters). Got " + ivHex.length + " characters.");
  const data = new TextEncoder().encode(pt);
  const enc = await crypto.subtle.encrypt({ name:"AES-GCM", iv, tagLength:128 }, key, data);
  return btoa(String.fromCharCode(...new Uint8Array(enc)));
}

async function decrypt(ct, keyHex, ivHex){
  const key = await importKey(keyHex);
  const iv = hexToBytes(ivHex);
  if(iv.length !== 12) throw new Error("IV must be exactly 12 bytes (24 hex characters). Got " + ivHex.length + " characters.");
  let data;
  try {
    data = Uint8Array.from(atob(ct), c=>c.charCodeAt(0));
  } catch(e) {
    throw new Error("Invalid ciphertext: not valid base64");
  }
  const dec = await crypto.subtle.decrypt({ name:"AES-GCM", iv, tagLength:128 }, key, data);
  return new TextDecoder().decode(dec);
}
