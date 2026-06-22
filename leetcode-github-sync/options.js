(function attachOptions(global) {
  const utils = global.LeetCodeSync;
  const form = document.getElementById("settingsForm");
  const message = document.getElementById("message");
  const fields = {
    githubToken: document.getElementById("githubToken"),
    githubOwner: document.getElementById("githubOwner"),
    repoName: document.getElementById("repoName"),
    branch: document.getElementById("branch")
  };

  function setMessage(text, type = "") {
    message.textContent = text;
    message.className = type;
  }

  async function load() {
    const settings = await utils.getSettings();
    Object.entries(fields).forEach(([key, input]) => {
      input.value = settings[key] || "";
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const settings = Object.fromEntries(
      Object.entries(fields).map(([key, input]) => [key, input.value.trim()])
    );

    try {
      await utils.saveSettings(settings);
      setMessage("Settings saved.", "success");
    } catch (error) {
      setMessage(error.message, "error");
    }
  });

  load().catch((error) => setMessage(error.message, "error"));
})(globalThis);
