# LeetCode GitHub Sync

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge)
![GitHub API](https://img.shields.io/badge/GitHub-Contents%20API-181717?style=for-the-badge&logo=github&logoColor=white)

A Manifest V3 Chrome extension that syncs accepted LeetCode solutions to GitHub from the browser. It does not use a backend server, paid service, or hardcoded token.

## At A Glance

| Feature | Status |
| --- | --- |
| Auto-sync accepted submissions | Built in |
| Manual popup sync | Built in |
| GitHub token settings page | Built in |
| SHA-based file updates | Built in |
| Topic-wise indexes | Built in |
| Duplicate README row protection | Built in |

## What It Does

- Detects `Accepted` submissions on LeetCode problem pages with a DOM observer.
- Extracts problem number, title, slug, editor code, language, difficulty, topic tags, and problem URL.
- Saves or updates files through the GitHub Contents API.
- Provides a popup with sync status and a manual sync button.
- Provides an options page for GitHub token, owner, repository, and branch settings.

## Folder Structure Created In GitHub

```text
Problems/
  0015-3sum/
    solution.py
    README.md

Topics/
  Array.md
  Two Pointers.md
  Sorting.md

README.md
```

For every accepted problem, the extension creates or updates:

- `Problems/<problem-number>-<slug>/solution.<ext>`
- `Problems/<problem-number>-<slug>/README.md`
- `Topics/<topic>.md`
- root `README.md`

Existing files are checked first. If a file already exists, the extension updates it with the file SHA required by the GitHub Contents API. README and topic tables are de-duplicated by problem number.

## Supported Languages

| LeetCode language | File extension |
| --- | --- |
| Python / Python3 | `.py` |
| JavaScript | `.js` |
| TypeScript | `.ts` |
| Java | `.java` |
| C++ | `.cpp` |
| C | `.c` |
| Go | `.go` |
| Rust | `.rs` |

Unknown languages are saved as `.txt`.

## Installation

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the `leetcode-github-sync` folder.
6. Pin the extension if you want quick popup access.

## Create A GitHub Token

Use a fine-grained personal access token when possible:

1. Open GitHub `Settings`.
2. Go to `Developer settings`.
3. Open `Personal access tokens`.
4. Create a fine-grained token.
5. Select the owner that contains `Leetcode-Solutions`.
6. Grant access to only the target repository.
7. Add repository permission: `Contents` with `Read and write`.
8. Copy the token.

Classic tokens also work, but they are broader. If you use a classic token, it needs the `repo` scope for private repositories or `public_repo` for public repositories.

## Configure The Extension

1. Click the extension icon.
2. Click `Settings`.
3. Enter:
   - GitHub token
   - GitHub owner, default `PRERAK-ARYA`
   - Repository name, default `Leetcode-Solutions`
   - Branch, default `main`
4. Click `Save settings`.

The token is stored using Chrome extension local storage. It is not present in source code and is not written to your repository.

## Usage

1. Open a LeetCode problem page.
2. Submit a solution.
3. When the result becomes `Accepted`, the extension attempts to sync automatically.
4. If auto-detection misses the page state, click the extension icon and press `Sync current accepted solution`.

The popup shows current status, the last synced problem, and the last sync time. Errors are shown in the popup and logged to the extension console.

## GitHub Commit Message

Each file update uses this format:

```text
Add solution for 0015. 3Sum
```

## Reliability Notes

LeetCode changes its UI over time, so the parser uses multiple fallbacks:

- URL parsing for problem slug.
- Multiple selectors and document title for problem title and number.
- Visible page text for accepted status and difficulty.
- Topic links and tag-like elements for topics.
- Monaco editor textarea, visible editor lines, and code blocks for code.

If extraction fails, use the manual popup button after clicking inside the editor. Helpful logs are written with the prefix `[LeetCode GitHub Sync]`.

## Files

- `manifest.json`: Chrome extension manifest.
- `contentScript.js`: Accepted-result observer and manual extraction responder.
- `background.js`: Sync coordinator.
- `popup.html` / `popup.js`: Status and manual sync UI.
- `options.html` / `options.js`: GitHub settings UI.
- `githubApi.js`: GitHub Contents API client and markdown generation.
- `leetcodeParser.js`: LeetCode page extraction helpers.
- `utils.js`: Shared storage, formatting, path, and encoding helpers.
