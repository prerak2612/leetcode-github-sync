(function attachUtils(global) {
  const DEFAULT_SETTINGS = {
    githubToken: "",
    githubOwner: "PRERAK-ARYA",
    repoName: "Leetcode-Solutions",
    branch: "main"
  };

  const LANGUAGE_EXTENSIONS = {
    python: "py",
    python3: "py",
    javascript: "js",
    typescript: "ts",
    java: "java",
    "c++": "cpp",
    cpp: "cpp",
    c: "c",
    go: "go",
    golang: "go",
    rust: "rs"
  };

  const LANGUAGE_ALIASES = {
    py: "Python3",
    python: "Python",
    python3: "Python3",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    java: "Java",
    "c++": "C++",
    cpp: "C++",
    c: "C",
    go: "Go",
    golang: "Go",
    rust: "Rust"
  };

  function normalizeLanguage(language) {
    const key = String(language || "").trim().toLowerCase().replace(/\s+/g, "");
    return LANGUAGE_ALIASES[key] || String(language || "Unknown").trim() || "Unknown";
  }

  function getFileExtension(language) {
    const key = String(language || "").trim().toLowerCase().replace(/\s+/g, "");
    return LANGUAGE_EXTENSIONS[key] || "txt";
  }

  function padProblemNumber(problemNumber) {
    const digits = String(problemNumber || "").match(/\d+/);
    return digits ? digits[0].padStart(4, "0") : "0000";
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getProblemFolder(problem) {
    const number = padProblemNumber(problem.problemNumber);
    const slug = slugify(problem.problemSlug || problem.problemTitle);
    return `Problems/${number}-${slug}`;
  }

  function escapeMarkdownCell(value) {
    return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  }

  function encodeBase64Utf8(content) {
    const bytes = new TextEncoder().encode(content);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function sanitizePathPart(value) {
    return String(value || "")
      .replace(/[\\/:*?"<>|#%{}^~[\]`]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  function chromePromise(fn) {
    return new Promise((resolve, reject) => {
      fn((result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  async function getSettings() {
    const settings = await chromePromise((done) => chrome.storage.local.get(DEFAULT_SETTINGS, done));
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  async function saveSettings(settings) {
    return chromePromise((done) => chrome.storage.local.set(settings, done));
  }

  async function getStatus() {
    return chromePromise((done) =>
      chrome.storage.local.get(
        {
          syncStatus: "Idle",
          lastSyncedProblem: "",
          lastSyncedAt: "",
          lastError: ""
        },
        done
      )
    );
  }

  async function saveStatus(status) {
    return chromePromise((done) => chrome.storage.local.set(status, done));
  }

  global.LeetCodeSync = {
    ...(global.LeetCodeSync || {}),
    DEFAULT_SETTINGS,
    normalizeLanguage,
    getFileExtension,
    padProblemNumber,
    slugify,
    getProblemFolder,
    escapeMarkdownCell,
    encodeBase64Utf8,
    sanitizePathPart,
    chromePromise,
    getSettings,
    saveSettings,
    getStatus,
    saveStatus
  };
})(globalThis);
