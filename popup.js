document.addEventListener("DOMContentLoaded", () => {
  const toggleVT = document.getElementById("toggleVT");
  const toggleRedirects = document.getElementById("toggleRedirects");
  const toggleTypos = document.getElementById("toggleTypos");
  const toggleBlacklist = document.getElementById("toggleBlacklist");
  const blacklistInput = document.getElementById("blacklistInput");

  // Load stored settings
  chrome.storage.sync.get([
    "toggleVT", "toggleRedirects", "toggleTypos", "toggleBlacklist", "customBlacklist"
  ], (data) => {
    toggleVT.checked = data.toggleVT ?? true;
    toggleRedirects.checked = data.toggleRedirects ?? true;
    toggleTypos.checked = data.toggleTypos ?? true;
    toggleBlacklist.checked = data.toggleBlacklist ?? false;
    blacklistInput.value = (data.customBlacklist || []).join(", ");
  });

  // Save on change
  [toggleVT, toggleRedirects, toggleTypos, toggleBlacklist, blacklistInput].forEach(el => {
    el.addEventListener("change", () => {
      chrome.storage.sync.set({
        toggleVT: toggleVT.checked,
        toggleRedirects: toggleRedirects.checked,
        toggleTypos: toggleTypos.checked,
        toggleBlacklist: toggleBlacklist.checked,
        customBlacklist: blacklistInput.value.split(",").map(d => d.trim()).filter(Boolean)
      }, () => {
        const feedback = document.getElementById("feedback");
        if (feedback) {
          feedback.textContent = "✅ Settings saved!";
          feedback.style.opacity = 1;
          setTimeout(() => {
            feedback.style.opacity = 0;
          }, 1500);
        }
      });
    });
  });
});
