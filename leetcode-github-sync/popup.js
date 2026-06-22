(function attachPopup(global) {
  const utils = global.LeetCodeSync;
  const syncButton = document.getElementById("syncButton");
  const settingsButton = document.getElementById("settingsButton");
  const message = document.getElementById("message");
  const syncStatus = document.getElementById("syncStatus");
  const lastSyncedProblem = document.getElementById("lastSyncedProblem");
  const lastSyncedAt = document.getElementById("lastSyncedAt");

  function setMessage(text, type = "") {
    message.textContent = text;
    message.className = type;
  }

  function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  }

  async function renderStatus() {
    const status = await utils.getStatus();
    syncStatus.textContent = status.syncStatus || "Idle";
    lastSyncedProblem.textContent = status.lastSyncedProblem || "None yet";
    lastSyncedAt.textContent = formatDate(status.lastSyncedAt);
    if (status.lastError) setMessage(status.lastError, "error");
  }

  async function getActiveLeetCodeTab() {
    const [tab] = await utils.chromePromise((done) =>
      chrome.tabs.query({ active: true, currentWindow: true }, done)
    );
    if (!tab || !tab.id || !/^https:\/\/leetcode\.com\/problems\//.test(tab.url || "")) {
      throw new Error("Open a LeetCode problem page before syncing.");
    }
    return tab;
  }

  async function extractFromTab(tabId) {
    return utils.chromePromise((done) =>
      chrome.tabs.sendMessage(tabId, { type: "EXTRACT_CURRENT_SOLUTION" }, done)
    );
  }

  async function sendToBackground(problem) {
    return utils.chromePromise((done) =>
      chrome.runtime.sendMessage({ type: "SYNC_ACCEPTED_PROBLEM", problem, source: "popup" }, done)
    );
  }

  syncButton.addEventListener("click", async () => {
    syncButton.disabled = true;
    setMessage("Reading the current LeetCode page...");

    try {
      const tab = await getActiveLeetCodeTab();
      const extracted = await extractFromTab(tab.id);
      if (!extracted?.ok) throw new Error("Could not read the current LeetCode page.");
      if (!extracted.problem.acceptedDetected) {
        setMessage("Accepted status is not visible, syncing the current editor code anyway.");
      }
      const response = await sendToBackground(extracted.problem);
      if (!response?.ok) throw new Error(response?.error || "Sync failed.");
      setMessage("Synced successfully.", "success");
      await renderStatus();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      syncButton.disabled = false;
    }
  });

  settingsButton.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  renderStatus().catch((error) => setMessage(error.message, "error"));
})(globalThis);
