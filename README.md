# LeetCode GitHub Sync

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge)
![No Backend](https://img.shields.io/badge/Backend-Not%20Required-111827?style=for-the-badge)
![GitHub Sync](https://img.shields.io/badge/GitHub-Auto%20Sync-181717?style=for-the-badge&logo=github&logoColor=white)

Automatically save accepted LeetCode solutions to GitHub with clean problem folders, solution files, per-problem notes, topic indexes, and a root solved-problems table.

This is a pure browser extension. No backend server, no paid service, and no hardcoded GitHub token.

## Highlights

- Auto-detects `Accepted` submissions on LeetCode problem pages.
- Extracts problem number, title, slug, current editor code, language, difficulty, topic tags, and LeetCode URL.
- Saves files with the GitHub Contents API.
- Creates new files or updates existing files using SHA checks.
- Avoids duplicate rows in root and topic README tables.
- Includes a manual popup sync button when LeetCode UI detection misses.
- Stores GitHub configuration in Chrome extension local storage.

## Generated Repository Layout

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

## Extension Files

The loadable Chrome extension lives in:

```text
leetcode-github-sync/
```

Important files:

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 configuration |
| `contentScript.js` | LeetCode page observer and extraction bridge |
| `background.js` | Sync coordinator |
| `githubApi.js` | GitHub Contents API create/update logic |
| `leetcodeParser.js` | LeetCode metadata and code extraction |
| `popup.html` / `popup.js` | Sync status and manual sync UI |
| `options.html` / `options.js` | GitHub settings page |
| `utils.js` | Shared helpers for storage, paths, encoding, and formatting |

## Quick Start

1. Clone or download this repository.
2. Open Chrome and visit `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the `leetcode-github-sync` folder.
6. Open the extension settings page.
7. Add your GitHub token, owner, repo name, and branch.
8. Submit a LeetCode solution and let the extension sync accepted code automatically.

## GitHub Token Permissions

Use a fine-grained personal access token when possible:

- Repository access: only your target solutions repository.
- Repository permission: `Contents` with `Read and write`.

Classic tokens also work, but they are broader:

- Public repository: `public_repo`
- Private repository: `repo`

Never commit your token. This project reads it only from the extension options page.

## Default Target

The extension defaults to:

| Setting | Default |
| --- | --- |
| Owner | `PRERAK-ARYA` |
| Repository | `Leetcode-Solutions` |
| Branch | `main` |

All of these are configurable from the options page.

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

## Commit Message Format

Synced files use commit messages like:

```text
Add solution for 0015. 3Sum
```

## Reliability

LeetCode changes its UI over time, so the extension uses multiple fallbacks: DOM observers, URL parsing, document title parsing, visible status text, topic links, Monaco editor textareas, visible editor lines, and code blocks.

When auto-detection misses, click the extension icon and use `Sync current accepted solution`.

## Security Notes

- No GitHub token is hardcoded.
- No `.env` file is required.
- No backend server receives your code or token.
- The token is stored in Chrome extension local storage.
- GitHub requests are made directly from the extension to `api.github.com`.

See the detailed extension documentation in [leetcode-github-sync/README.md](leetcode-github-sync/README.md).
