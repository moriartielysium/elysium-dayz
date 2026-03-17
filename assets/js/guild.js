(async function initGuildPage() {
  const statusBox = document.getElementById("status");
  const guildInfo = document.getElementById("guildInfo");
  const guildName = document.getElementById("guildName");
  const saveBtn = document.getElementById("saveBtn");

  try {
    await requireAuth();

    initTabs();

    const params = new URLSearchParams(window.location.search);
    const guildId = params.get("id");

    if (!guildId) {
      throw new Error("Missing guild id in URL");
    }

    const data = await apiGet(`/api/guild-settings-get?id=${encodeURIComponent(guildId)}`);

    renderGuildHeader(data);
    fillForm(data.settings);
    fillOverview(data);
  } catch (error) {
    guildName.textContent = "Ошибка";
    guildInfo.textContent = "Не удалось загрузить сервер";
    statusBox.className = "status error";
    statusBox.textContent = error.message;
  }

  saveBtn.addEventListener("click", async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const guildId = params.get("id");

      statusBox.className = "status";
      statusBox.textContent = "Сохранение...";

      const payload = {
        guildId,
        logChannelId: document.getElementById("logChannelId").value,
        adminRoleId: document.getElementById("adminRoleId").value,
        language: document.getElementById("language").value,
        notificationsEnabled: document.getElementById("notificationsEnabled").value === "true",
        nitradoServiceId: document.getElementById("nitradoServiceId").value,
        nitradoServerName: document.getElementById("nitradoServerName").value,
        setupCompleted: document.getElementById("setupCompleted").value === "true"
      };

      const result = await apiPost("/api/guild-settings-save", payload);

      fillOverview({
        guild: {
          id: guildId,
          name: document.getElementById("overviewGuildName").textContent
        },
        settings: result.settings
      });

      updateBadges(guildId, result.settings);

      statusBox.className = "status";
      statusBox.textContent = "Настройки сохранены";
    } catch (error) {
      statusBox.className = "status error";
      statusBox.textContent = error.message;
    }
  });
})();

function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(`tab-${target}`).classList.add("active");
    });
  });
}

function renderGuildHeader(data) {
  const guild = data.guild;
  const settings = data.settings;

  document.getElementById("guildName").textContent = guild.name || "Unknown Guild";
  document.getElementById("guildInfo").textContent = `Управление сервером ${guild.name} (${guild.id})`;

  updateBadges(guild.id, settings);
}

function updateBadges(guildId, settings) {
  document.getElementById("badgeGuildId").textContent = `Guild ID: ${guildId}`;
  document.getElementById("badgeSetup").textContent = `Setup: ${settings.setupCompleted ? "Completed" : "Not Completed"}`;
  document.getElementById("badgeLanguage").textContent = `Language: ${settings.language || "ru"}`;
  document.getElementById("badgeNotifications").textContent =
    `Notifications: ${settings.notificationsEnabled ? "Enabled" : "Disabled"}`;
}

function fillForm(settings) {
  document.getElementById("logChannelId").value = settings.logChannelId || "";
  document.getElementById("adminRoleId").value = settings.adminRoleId || "";
  document.getElementById("language").value = settings.language || "ru";
  document.getElementById("notificationsEnabled").value = String(Boolean(settings.notificationsEnabled));
  document.getElementById("nitradoServiceId").value = settings.nitradoServiceId || "";
  document.getElementById("nitradoServerName").value = settings.nitradoServerName || "";
  document.getElementById("setupCompleted").value = String(Boolean(settings.setupCompleted));
}

function fillOverview(data) {
  const guild = data.guild;
  const settings = data.settings;

  document.getElementById("overviewGuildName").textContent = guild.name || "-";
  document.getElementById("overviewGuildId").textContent = guild.id || "-";
  document.getElementById("overviewLanguage").textContent = settings.language || "ru";
  document.getElementById("overviewSetup").textContent = settings.setupCompleted ? "Yes" : "No";
  document.getElementById("overviewLogChannel").textContent = settings.logChannelId || "Not set";
  document.getElementById("overviewAdminRole").textContent = settings.adminRoleId || "Not set";
  document.getElementById("overviewNotifications").textContent =
    settings.notificationsEnabled ? "Enabled" : "Disabled";
}
