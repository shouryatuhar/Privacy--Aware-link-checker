document.getElementById("save").addEventListener("click", () => {
  const lines = document.getElementById("blacklist").value
    .split('\n')
    .map(d => d.trim())
    .filter(Boolean);
  chrome.storage.sync.set({ customBlacklist: lines }, () => {
    document.getElementById("status").textContent = "✅ Saved!";
  });
});

chrome.storage.sync.get("customBlacklist", data => {
  document.getElementById("blacklist").value = (data.customBlacklist || []).join("\n");
});
