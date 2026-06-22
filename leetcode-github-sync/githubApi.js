(function attachGithubApi(global) {
  const utils = global.LeetCodeSync;
  const API_ROOT = "https://api.github.com";

  class GitHubApi {
    constructor(settings) {
      this.owner = settings.githubOwner;
      this.repo = settings.repoName;
      this.branch = settings.branch;
      this.token = settings.githubToken;
    }

    assertConfigured() {
      if (!this.token) throw new Error("GitHub token is missing. Open settings and add a token.");
      if (!this.owner || !this.repo || !this.branch) {
        throw new Error("GitHub owner, repository, and branch are required.");
      }
    }

    async request(path, options = {}) {
      this.assertConfigured();
      const response = await fetch(`${API_ROOT}${path}`, {
        ...options,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.message || `GitHub API error ${response.status}`);
      }

      if (response.status === 204) return null;
      return response.json();
    }

    async getFile(path) {
      const encodedPath = path.split("/").map(encodeURIComponent).join("/");
      const url = `/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/contents/${encodedPath}?ref=${encodeURIComponent(this.branch)}`;
      try {
        return await this.request(url);
      } catch (error) {
        if (/not found/i.test(error.message)) return null;
        throw error;
      }
    }

    async getTextFile(path) {
      const file = await this.getFile(path);
      if (!file || !file.content) return "";
      const base64 = file.content.replace(/\s/g, "");
      return new TextDecoder().decode(Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)));
    }

    async upsertFile(path, content, message) {
      const existing = await this.getFile(path);
      const body = {
        message,
        content: utils.encodeBase64Utf8(content),
        branch: this.branch
      };
      if (existing && existing.sha) body.sha = existing.sha;

      const encodedPath = path.split("/").map(encodeURIComponent).join("/");
      return this.request(
        `/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/contents/${encodedPath}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );
    }
  }

  function buildProblemReadme(problem) {
    const topics = (problem.topicTags || []).length ? problem.topicTags.join(", ") : "Unknown";
    return `# ${utils.padProblemNumber(problem.problemNumber)}. ${problem.problemTitle}

| Field | Value |
| --- | --- |
| Difficulty | ${utils.escapeMarkdownCell(problem.difficulty || "Unknown")} |
| Topics | ${utils.escapeMarkdownCell(topics)} |
| Language | ${utils.escapeMarkdownCell(problem.language || "Unknown")} |
| LeetCode | [Problem Link](${problem.problemUrl}) |

## Solution

See the solution file in this folder.
`;
  }

  function problemRow(problem, folder) {
    const number = utils.padProblemNumber(problem.problemNumber);
    const title = utils.escapeMarkdownCell(problem.problemTitle);
    const difficulty = utils.escapeMarkdownCell(problem.difficulty || "Unknown");
    const language = utils.escapeMarkdownCell(problem.language || "Unknown");
    const topics = utils.escapeMarkdownCell((problem.topicTags || []).join(", ") || "Unknown");
    return `| ${number} | [${title}](${folder}/README.md) | ${difficulty} | ${language} | ${topics} | [LeetCode](${problem.problemUrl}) |`;
  }

  function mergeTableRow(markdown, header, row, keyPattern) {
    const normalized = markdown && markdown.trim() ? markdown.trim() : header;
    const lines = normalized.split(/\r?\n/).filter((line) => !keyPattern.test(line));
    lines.push(row);
    return `${lines.join("\n")}\n`;
  }

  function buildRootReadme(existing, problem, folder) {
    const header = `# LeetCode Solutions

Automatically synced accepted LeetCode solutions.

| # | Problem | Difficulty | Language | Topics | Link |
| --- | --- | --- | --- | --- | --- |`;
    const keyPattern = new RegExp(`^\\|\\s*${utils.padProblemNumber(problem.problemNumber)}\\s*\\|`);
    return mergeTableRow(existing, header, problemRow(problem, folder), keyPattern);
  }

  function buildTopicReadme(existing, topic, problem, folder) {
    const header = `# ${topic}

| # | Problem | Difficulty | Language | Link |
| --- | --- | --- | --- | --- |`;
    const number = utils.padProblemNumber(problem.problemNumber);
    const row = `| ${number} | [${utils.escapeMarkdownCell(problem.problemTitle)}](../${folder}/README.md) | ${utils.escapeMarkdownCell(problem.difficulty || "Unknown")} | ${utils.escapeMarkdownCell(problem.language || "Unknown")} | [LeetCode](${problem.problemUrl}) |`;
    const keyPattern = new RegExp(`^\\|\\s*${number}\\s*\\|`);
    return mergeTableRow(existing, header, row, keyPattern);
  }

  async function syncAcceptedProblem(problem) {
    if (!problem || !problem.problemTitle || !problem.problemSlug) {
      throw new Error("Could not read problem details from this page.");
    }
    if (!problem.code || problem.code.trim().length === 0) {
      throw new Error("Could not read code from the editor. Try clicking in the editor, then sync again.");
    }

    const settings = await utils.getSettings();
    const api = new GitHubApi(settings);
    const folder = utils.getProblemFolder(problem);
    const ext = utils.getFileExtension(problem.language);
    const number = utils.padProblemNumber(problem.problemNumber);
    const commitMessage = `Add solution for ${number}. ${problem.problemTitle}`;

    await api.upsertFile(`${folder}/solution.${ext}`, `${problem.code.trimEnd()}\n`, commitMessage);
    await api.upsertFile(`${folder}/README.md`, buildProblemReadme(problem), commitMessage);

    const rootReadme = await api.getTextFile("README.md");
    await api.upsertFile("README.md", buildRootReadme(rootReadme, problem, folder), commitMessage);

    const topics = (problem.topicTags || []).filter(Boolean);
    for (const topic of topics) {
      const topicFile = `Topics/${utils.sanitizePathPart(topic)}.md`;
      const existing = await api.getTextFile(topicFile);
      await api.upsertFile(topicFile, buildTopicReadme(existing, topic, problem, folder), commitMessage);
    }

    return {
      folder,
      solutionPath: `${folder}/solution.${ext}`,
      repositoryUrl: `https://github.com/${settings.githubOwner}/${settings.repoName}/tree/${settings.branch}/${folder}`
    };
  }

  global.LeetCodeSync = {
    ...(global.LeetCodeSync || {}),
    GitHubApi,
    syncAcceptedProblem
  };
})(globalThis);
