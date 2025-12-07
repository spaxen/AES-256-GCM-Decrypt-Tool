// App wiring: DOM interactions and event handlers

function applyIvHighlight(){
  const el = $("ciphertext");
  const raw = el.textContent || "";
  const sep = raw.indexOf("|");

  if (sep === -1) return;

  const iv = raw.slice(0, sep).trim();
  const ct = raw.slice(sep + 1);

  if (!/^[0-9a-fA-F]{24}$/.test(iv)) return;

  const safeCt = ct.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  el.innerHTML = `<span class="iv-highlight">${iv}</span>|${safeCt}`;
}

// Buttons and controls
$("genKey").onclick=()=> $("keyhex").value=bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
$("genIv").onclick=()=> $("ivhex").value=bytesToHex(crypto.getRandomValues(new Uint8Array(12)));

$("copyKey").onclick=()=>navigator.clipboard.writeText($("keyhex").value);
$("copyIv").onclick=()=>navigator.clipboard.writeText($("ivhex").value);

$("encryptCopyBtn").onclick = async () => {
  try {
    const key = $("keyhex").value.trim();
    const iv  = bytesToHex(crypto.getRandomValues(new Uint8Array(12)));
    const pt  = $("plaintext").textContent;

    const ct = await encrypt(pt, key, iv);
    const combined = iv + "|" + ct;

    $("ciphertext").textContent = combined;
    applyIvHighlight();
    $("ivhex").value = iv;

    await navigator.clipboard.writeText(combined);

    $("message").style.display="block";
    $("error").style.display="none";
    $("message").textContent="Encrypted & copied";
  } catch (e) {
    $("message").style.display="none";
    $("error").style.display="block";
    $("error").textContent=e.message;
  }
};

$("decryptBtn").onclick = async () => {
  try {
    let raw = $("ciphertext").textContent.trim();
    let iv, ct;

    if (raw.includes("|")){
      [iv, ct] = raw.split("|",2);
      $("ivhex").value = iv;
    } else {
      iv = $("ivhex").value.trim();
      ct = raw;
    }

    const pt = await decrypt(ct, $("keyhex").value.trim(), iv);
    $("plaintext").textContent = pt;

    $("message").style.display="block";
    $("error").style.display="none";
    $("message").textContent="Decryption successful";
  } catch (e) {
    $("message").style.display="none";
    $("error").style.display="block";
    $("error").textContent="Decrypt failed: " + e.message;
  }
};

$("pasteCombined").onclick = async () => {
  const txt = await navigator.clipboard.readText();
  $("ciphertext").textContent = txt;
  applyIvHighlight();
};

$("clearCipherBtn").onclick=()=> $("ciphertext").textContent="";
$("clearBtn").onclick=()=> $("plaintext").textContent="";
$("clearAllBtn").onclick=()=>{
  $("ciphertext").textContent="";
  $("plaintext").textContent="";
  $("keyhex").value="";
  $("ivhex").value="";
};

// INIT
$("ivhex").value = bytesToHex(crypto.getRandomValues(new Uint8Array(12)));

enableAutoSelect($("keyhex"));
enableAutoSelect($("ivhex"));
enableAutoSelect($("ciphertext"));
enableAutoSelect($("plaintext"));

// keep highlight when blurred
$("ciphertext").addEventListener("blur", applyIvHighlight);
