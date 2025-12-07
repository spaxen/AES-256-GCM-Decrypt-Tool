// App wiring: DOM interactions and event handlers

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function applyIvHighlight(){
  const el = $("ciphertext");
  const raw = el.textContent || "";
  const sep = raw.indexOf("|");

  if (sep === -1) return;

  const iv = raw.slice(0, sep).trim();
  const ct = raw.slice(sep + 1);

  if (!/^[0-9a-fA-F]{24}$/.test(iv)) return;

  const safeIv = escapeHtml(iv);
  const safeCt = ct.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  el.innerHTML = `<span class="iv-highlight">${safeIv}</span>|${safeCt}`;
}

function setButtonLoading(btnId, isLoading) {
  const btn = $(btnId);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.style.opacity = isLoading ? "0.6" : "1";
  btn.style.cursor = isLoading ? "not-allowed" : "pointer";
}

// Buttons and controls
$("genKey").onclick=()=> $("keyhex").value=bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
$("genIv").onclick=()=> $("ivhex").value=bytesToHex(crypto.getRandomValues(new Uint8Array(12)));

$("copyKey").onclick=()=> {
  const val = $("keyhex").value.trim();
  if (!val) { showError("Key is empty"); return; }
  navigator.clipboard.writeText(val).then(() => showMessage("Key copied")).catch(e => showError("Copy failed: " + e.message));
};
$("copyIv").onclick=()=> {
  const val = $("ivhex").value.trim();
  if (!val) { showError("IV is empty"); return; }
  navigator.clipboard.writeText(val).then(() => showMessage("IV copied")).catch(e => showError("Copy failed: " + e.message));
};

function showMessage(text) {
  $("message").style.display="block";
  $("error").style.display="none";
  $("message").textContent=text;
}

function showError(text) {
  $("message").style.display="none";
  $("error").style.display="block";
  $("error").textContent=text;
}

$("encryptCopyBtn").onclick = async () => {
  try {
    const key = $("keyhex").value.trim();
    const iv  = bytesToHex(crypto.getRandomValues(new Uint8Array(12)));
    const pt  = $("plaintext").textContent;

    if (!key) throw new Error("Key is empty");
    if (!pt) throw new Error("Plaintext is empty");

    setButtonLoading("encryptCopyBtn", true);

    const ct = await encrypt(pt, key, iv);
    const combined = iv + "|" + ct;

    $("ciphertext").textContent = combined;
    applyIvHighlight();
    $("ivhex").value = iv;

    await navigator.clipboard.writeText(combined).catch(e => { throw new Error("Copy to clipboard failed: " + e.message); });

    showMessage("Encrypted & copied (" + pt.length + " chars)");
  } catch (e) {
    showError(e.message || "Encryption failed");
  } finally {
    setButtonLoading("encryptCopyBtn", false);
  }
};

$("decryptBtn").onclick = async () => {
  try {
    let raw = $("ciphertext").textContent.trim();
    let iv, ct;

    if (!raw) throw new Error("Ciphertext is empty");

    if (raw.includes("|")){
      [iv, ct] = raw.split("|",2);
      $("ivhex").value = iv;
    } else {
      iv = $("ivhex").value.trim();
      ct = raw;
    }

    if (!iv) throw new Error("IV is missing");
    if (!ct) throw new Error("Ciphertext is missing");

    setButtonLoading("decryptBtn", true);

    const pt = await decrypt(ct, $("keyhex").value.trim(), iv);
    $("plaintext").textContent = pt;

    showMessage("Decryption successful (" + pt.length + " chars)");
  } catch (e) {
    showError("Decrypt failed: " + (e.message || "Unknown error"));
  } finally {
    setButtonLoading("decryptBtn", false);
  }
};

$("pasteCombined").onclick = async () => {
  try {
    const txt = await navigator.clipboard.readText();
    $("ciphertext").textContent = txt;
    applyIvHighlight();
    showMessage("Pasted");
  } catch (e) {
    showError("Paste failed: " + (e.message || "Permission denied"));
  }
};

$("clearCipherBtn").onclick=()=> {
  $("ciphertext").textContent="";
  $("message").style.display="none";
};
$("clearBtn").onclick=()=> {
  $("plaintext").textContent="";
  $("message").style.display="none";
};
$("clearAllBtn").onclick=()=>{
  $("ciphertext").textContent="";
  $("plaintext").textContent="";
  $("keyhex").value="";
  $("ivhex").value="";
  $("message").style.display="none";
  $("error").style.display="none";
};

// INIT
$("ivhex").value = bytesToHex(crypto.getRandomValues(new Uint8Array(12)));

function safeEnableAutoSelect(el) {
  if (!el) return;
  let selectTimeout = null;
  el.addEventListener("focus", () => {
    clearTimeout(selectTimeout);
    selectTimeout = setTimeout(() => {
      if (el.tagName === "INPUT") {
        try { el.select(); } catch {}
      } else {
        const r = document.createRange();
        r.selectNodeContents(el);
        const s = window.getSelection();
        if (s) {
          s.removeAllRanges();
          s.addRange(r);
        }
      }
    }, 10);
  });
}

safeEnableAutoSelect($("keyhex"));
safeEnableAutoSelect($("ivhex"));
safeEnableAutoSelect($("ciphertext"));
safeEnableAutoSelect($("plaintext"));

// keep highlight when blurred
$("ciphertext").addEventListener("blur", applyIvHighlight);
