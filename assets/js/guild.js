(async function initGuildPage() {
  const statusBox = document.getElementById("status");
  const guildInfo = document.getElementById("guildInfo");
  const saveBtn = document.getElementById("saveBtn");

  try {
    await requireAuth();

    const params = new URLSearchParams(window.location.search);
    const guildId = params.get("id");

    if (!guildId) {
      throw new Error("Missing guild id in URL");
    }

    const data = await apiGet(`/api/guild-settings-get?id=${encodeURIComponent(guildId)}`);

    guildInfo.textContent = `${data.guild.name} (${data.guild.id})`;

    document.getElementById("logChannelId").value = data.settings.logChannelId || "";
    document.getElementById("adminRoleId").value = data.settings.adminRoleId || "";
    document.getElementById("language").value = data.settings.language || "ru";
    document.getElementById("notificationsEnabled").value = String(Boolean(data.settings.notificationsEnabled));
    document.getElementById("nitradoServiceId").value = data.settings.nitradoServiceId || "";
    document.getElementById("nitradoServerName").value = data.settings.nitradoServerName || "";
    document.getElementById("setupCompleted").value = String(Boolean(data.settings.setupCompleted));

    saveBtn.addEventListener("click", async () => {
      try {
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

        await apiPost("/api/guild-settings-save", payload);

        statusBox.className = "status";
        statusBox.textContent = "Настройки сохранены";
      } catch (error) {
        statusBox.className = "status error";
        statusBox.textContent = error.message;
      }
    });
  } catch (error) {
    guildInfo.textContent = "Ошибка загрузки сервера";
    statusBox.className = "status error";
    statusBox.textContent = error.message;
  }
})();
