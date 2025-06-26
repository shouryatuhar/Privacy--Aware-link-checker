// 🔒 Privacy-Aware Link Checker - content.js

const trustedDomains = ["google.com", "facebook.com", "amazon.com"];

function stripTrackingParams(url) {
  try {
    const clean = new URL(url);
    const paramsToRemove = ["utm_source", "utm_medium", "utm_campaign", "ref"];
    paramsToRemove.forEach(p => clean.searchParams.delete(p));
    return clean.toString();
  } catch {
    return url;
  }
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array(b.length + 1).fill(i));
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = a[i - 1] === b[j - 1]
        ? matrix[i - 1][j - 1]
        : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
    }
  }
  return matrix[a.length][b.length];
}
async function traceRedirectsViaProxy(url) {
  try {
    const proxyURL = `https://workers-playground-fancy-sound-a032.shouryatuhar.workers.dev/?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyURL);
    const data = await res.json();

    if (data.location) {
      console.warn(`🔁 Redirect detected: ${url} → ${data.location}`);
    } else {
      console.log("✅ No redirects detected.");
    }
  } catch (err) {
    console.warn("❌ Redirect tracing via proxy failed:", err.message);
  }
}




function checkDomainWithVirusTotal(domain) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "checkVT", domain }, (response) => {
      const isMalicious = response?.isMalicious || false;
      if (isMalicious) {
        chrome.runtime.sendMessage({ type: "updateBadge", alert: true });
      }
      resolve(isMalicious);
    });
  });
}
function showCopyButton(cleanURL, target) {
  // Remove any existing button
  document.getElementById("copy-clean-link-btn")?.remove();

  const btn = document.createElement("button");
  btn.id = "copy-clean-link-btn";
  btn.innerText = "Copy Clean Link";

  btn.style.cssText = `
    position: absolute;
    top: ${target.getBoundingClientRect().top + window.scrollY + 20}px;
    left: ${target.getBoundingClientRect().left + window.scrollX}px;
    z-index: 9999;
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;

  btn.onclick = () => {
    navigator.clipboard.writeText(cleanURL);
    btn.innerText = "✅ Copied!";
    setTimeout(() => btn.remove(), 2000);
  };

  document.body.appendChild(btn);
}


function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get([
      "toggleVT",
      "toggleTypos",
      "toggleRedirects",
      "toggleBlacklist",
      "customBlacklist"
    ], resolve);
  });
}

document.addEventListener("mouseover", async (e) => {
  const target = e.target.closest("a");
  if (!target || !target.href) return;

  let link, domain;
  try {
    link = new URL(target.href);
    domain = link.hostname.replace(/^www\./, "");
  } catch {
    return;
  }

  const settings = await getSettings();
  console.log("Hovered link:", target.href);

  // Blacklist check
  if (settings.toggleBlacklist && settings.customBlacklist?.includes(domain)) {
    console.warn(`⚠️ Blacklisted domain: ${domain}`);
    target.style.border = "2px solid red";
    target.title = "⚠️ Blacklisted domain!";
  }

  // VirusTotal check
  if (settings.toggleVT) {
    const isMalicious = await checkDomainWithVirusTotal(domain);
    if (isMalicious) {
      console.error(`☠️ VirusTotal flagged: ${domain}`);
      target.style.border = "2px solid red";
      target.style.backgroundColor = "#ffdddd";
      target.title = "☠️ WARNING: Flagged by VirusTotal";
    }
  }

  // Typosquatting check
  if (settings.toggleTypos) {
    for (const trusted of trustedDomains) {
      const dist = levenshtein(domain, trusted);
      if (dist > 0 && dist <= 2) {
        console.warn(`⚠️ Suspicious link: ${domain} ≈ ${trusted}`);
        target.style.border = "2px dashed orange";
        target.title = `⚠️ Looks like ${trusted}`;
        break;
      }
    }
  }

// Redirect tracing via proxy
if (settings.toggleRedirects) {
  try {
    await traceRedirectsViaProxy(target.href);
  } catch {
    console.warn("❌ Redirect tracing via proxy failed");
  }
}




  // Clean link feature
  const cleanURL = stripTrackingParams(target.href);
if (cleanURL !== target.href) {
  showCopyButton(cleanURL, target);
  console.log("🧼 Clean URL:", cleanURL);
} else {
  document.getElementById("copy-clean-link-btn")?.remove();
}

});

document.addEventListener("mouseout", () => {
  document.getElementById("copy-clean-link-btn")?.remove();
});
