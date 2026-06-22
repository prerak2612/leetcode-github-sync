(function attachLeetCodeParser(global) {
  const utils = global.LeetCodeSync;

  function visibleText(selector, root = document) {
    const node = root.querySelector(selector);
    return node ? node.textContent.trim() : "";
  }

  function getProblemSlug() {
    const match = location.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1] : "";
  }

  function getProblemTitleAndNumber() {
    const candidates = [
      visibleText('[data-cy="question-title"]'),
      visibleText("a[href^='/problems/'] + div"),
      visibleText("h1"),
      document.title.replace(/ - LeetCode.*/, "")
    ].filter(Boolean);

    for (const candidate of candidates) {
      const match = candidate.match(/^\s*(\d+)\.\s*(.+)$/);
      if (match) {
        return { problemNumber: match[1], problemTitle: match[2].trim() };
      }
    }

    const title = candidates[0] || utils.slugify(getProblemSlug()).replace(/-/g, " ");
    return { problemNumber: "", problemTitle: title };
  }

  function getDifficulty() {
    const text = document.body.innerText || "";
    const match = text.match(/\b(Easy|Medium|Hard)\b/);
    return match ? match[1] : "Unknown";
  }

  function getTopicTags() {
    const tags = new Set();
    document.querySelectorAll('a[href*="/tag/"], a[href*="/topics/"], [class*="tag"]').forEach((node) => {
      const text = node.textContent.trim();
      if (text && text.length <= 40 && !/^(premium|companies|hint)$/i.test(text)) {
        tags.add(text);
      }
    });
    return [...tags].filter((tag) => !["Easy", "Medium", "Hard"].includes(tag));
  }

  function getLanguage() {
    const bodyText = document.body.innerText || "";
    const languages = ["Python3", "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "Go", "Rust"];
    const controls = [...document.querySelectorAll("button, [role='button'], span, div")]
      .map((node) => node.textContent.trim())
      .filter((text) => text.length > 0 && text.length < 40);

    for (const text of controls) {
      const match = languages.find((language) => new RegExp(`^${language.replace("+", "\\+")}$`, "i").test(text));
      if (match) return utils.normalizeLanguage(match);
    }

    for (const language of languages) {
      if (bodyText.includes(language)) return utils.normalizeLanguage(language);
    }

    try {
      const values = Object.keys(localStorage)
        .filter((key) => /language|lang/i.test(key))
        .map((key) => localStorage.getItem(key))
        .join(" ");
      for (const language of languages) {
        if (new RegExp(language.replace("+", "\\+"), "i").test(values)) {
          return utils.normalizeLanguage(language);
        }
      }
    } catch (error) {
      console.debug("[LeetCode GitHub Sync] Could not inspect localStorage language", error);
    }

    return "Unknown";
  }

  function getCodeFromEditor() {
    const textareas = [...document.querySelectorAll(".monaco-editor textarea, textarea")];
    const textarea = textareas.find((node) => node.value && node.value.trim().length > 0);
    if (textarea) return textarea.value;

    const viewLines = [...document.querySelectorAll(".monaco-editor .view-lines .view-line")];
    if (viewLines.length > 0) {
      return viewLines.map((line) => line.textContent || "").join("\n").trimEnd();
    }

    const codeBlocks = [...document.querySelectorAll("pre, code")].map((node) => node.textContent.trim());
    return codeBlocks.sort((a, b) => b.length - a.length)[0] || "";
  }

  function isAcceptedVisible() {
    const text = document.body.innerText || "";
    return /\bAccepted\b/.test(text) && !/\bWrong Answer\b|\bRuntime Error\b|\bTime Limit Exceeded\b/.test(text);
  }

  function extractProblemData() {
    const { problemNumber, problemTitle } = getProblemTitleAndNumber();
    const problemSlug = getProblemSlug() || utils.slugify(problemTitle);
    const code = getCodeFromEditor();
    const language = getLanguage();

    return {
      problemNumber,
      problemTitle,
      problemSlug,
      code,
      language,
      difficulty: getDifficulty(),
      topicTags: getTopicTags(),
      problemUrl: `https://leetcode.com/problems/${problemSlug}/`,
      acceptedDetected: isAcceptedVisible(),
      extractedAt: new Date().toISOString()
    };
  }

  global.LeetCodeSync = {
    ...(global.LeetCodeSync || {}),
    extractProblemData,
    isAcceptedVisible
  };
})(globalThis);
