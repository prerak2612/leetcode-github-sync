importScripts("utils.js", "githubApi.js");

const { syncAcceptedProblem, saveStatus } = globalThis.LeetCodeSync;

async function syncProblem(problem, source) {
  console.log("[LeetCode GitHub Sync] Sync requested", { source, problem });
  await saveStatus({
    syncStatus: "Syncing...",
    lastError: ""
  });

  try {
    const result = await syncAcceptedProblem(problem);
    await saveStatus({
      syncStatus: "Synced",
      lastSyncedProblem: `${problem.problemNumber}. ${problem.problemTitle}`,
      lastSyncedAt: new Date().toISOString(),
      lastError: ""
    });
    console.log("[LeetCode GitHub Sync] Sync complete", result);
    return { ok: true, result };
  } catch (error) {
    await saveStatus({
      syncStatus: "Error",
      lastError: error.message
    });
    console.error("[LeetCode GitHub Sync] Sync failed", error);
    return { ok: false, error: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SYNC_ACCEPTED_PROBLEM") {
    syncProblem(message.problem, message.source || "unknown").then(sendResponse);
    return true;
  }

  if (message?.type === "AUTO_ACCEPTED_DETECTED") {
    syncProblem(message.problem, "auto-detected").then(sendResponse);
    return true;
  }

  if (message?.type === "GET_STATUS") {
    globalThis.LeetCodeSync.getStatus().then((status) => sendResponse({ ok: true, status }));
    return true;
  }

  return false;
});
