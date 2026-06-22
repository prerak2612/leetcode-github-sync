(function attachContentScript(global) {
  const { extractProblemData, isAcceptedVisible } = global.LeetCodeSync;
  let lastAutoSyncKey = "";
  let acceptedTimer = null;

  function getSyncKey(problem) {
    return `${problem.problemSlug}:${problem.language}:${problem.code.length}`;
  }

  async function sendAcceptedProblem(source) {
    const problem = extractProblemData();
    const syncKey = getSyncKey(problem);
    if (source === "auto" && syncKey === lastAutoSyncKey) return;
    lastAutoSyncKey = syncKey;

    console.log("[LeetCode GitHub Sync] Accepted solution detected", problem);
    chrome.runtime.sendMessage(
      {
        type: source === "auto" ? "AUTO_ACCEPTED_DETECTED" : "SYNC_ACCEPTED_PROBLEM",
        problem,
        source
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("[LeetCode GitHub Sync] Message failed", chrome.runtime.lastError.message);
          return;
        }
        console.log("[LeetCode GitHub Sync] Background response", response);
      }
    );
  }

  function checkAcceptedSoon() {
    clearTimeout(acceptedTimer);
    acceptedTimer = setTimeout(() => {
      if (isAcceptedVisible()) {
        sendAcceptedProblem("auto");
      }
    }, 800);
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "EXTRACT_CURRENT_SOLUTION") {
      sendResponse({ ok: true, problem: extractProblemData() });
    }
    return false;
  });

  const observer = new MutationObserver(checkAcceptedSoon);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  checkAcceptedSoon();
  console.log("[LeetCode GitHub Sync] Content script loaded");
})(globalThis);
