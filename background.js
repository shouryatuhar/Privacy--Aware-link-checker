// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => alert("🔒 Privacy-Aware Link Checker Active!")
  });
});
// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed");

  chrome.storage.sync.set({
    toggleVT: true,
    toggleTypos: true,
    toggleRedirects: true,
    toggleBlacklist: true,
    customBlacklist: ["faceb00k.com", "goog1e.com", "malicious-site.com"]
  }, () => {
    console.log("✅ Default settings and blacklist initialized.");
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => alert("🔒 Privacy-Aware Link Checker Active!")
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 🛡️ VirusTotal domain check
  if (request.type === "checkVT") {
    const apiKey = "35474744e25158363025231f6094c16e462afde8c64c694a5f055d9c2615a550";
    const domain = request.domain;

    fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      method: "GET",
      headers: {
        "x-apikey": apiKey
      }
    })
    .then(res => res.json())
    .then(data => {
      const malicious = data?.data?.attributes?.last_analysis_stats?.malicious || 0;
      sendResponse({ isMalicious: malicious > 0 });
    })
    .catch(err => {
      console.error("VirusTotal Error:", err);
      sendResponse({ isMalicious: false });
    });

    return true; // keep message channel open
  }

  // 🔁 Redirect trace
  if (request.type === "traceRedirects") {
    fetch(request.url, {
      method: "HEAD",
      redirect: "follow"
    })
    .then(response => {
      const finalUrl = response.url;
      const isRedirected = finalUrl !== request.url;
      sendResponse({ redirected: isRedirected, finalUrl });
    })
    .catch(error => {
      console.error("Redirect check failed:", error);
      sendResponse({ redirected: false, error: true });
    });

    return true;
  }

  // 🔔 Badge update
  if (request.type === "updateBadge") {
    chrome.action.setBadgeText({ text: request.alert ? "⚠️" : "" });
    chrome.action.setBadgeBackgroundColor({ color: request.alert ? "#FF0000" : "#00FF00" });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    toggleVT: true,
    toggleTypos: true,
    toggleRedirects: true,
    toggleBlacklist: true,
    customBlacklist: ["faceb00k.com", "goog1e.com", "malicious-site.com"]
  }, () => {
    console.log("✅ Default settings and blacklist initialized.");
  });
});
