(async function initDashboard() {
  const meBox = document.getElementById("me");
  const guildsBox = document.getElementById("guilds");

  try {
    meBox.textContent = "Проверка авторизации...";

    const user = await requireAuth();
    const guildData = await apiGet("/api/guilds");
    const guilds = guildData.guilds || [];

    meBox.textContent =
      `Вы вошли как ${user.username} (${user.id})` +
      (user.isSuperAdmin ? " • Super Admin" : " • User");

    if (!guilds.length) {
      guildsBox.innerHTML = `
        <div class="card">
          <h3>Серверы не найдены</h3>
          <div class="muted">Список серверов пуст.</div>
        </div>
      `;
      return;
    }

    guildsBox.innerHTML = guilds.map((guild) => `
      <div class="card">
        <h3>${escapeHtml(guild.name)}</h3>
        <div class="muted">Guild ID: ${guild.id}</div>
        <div style="margin-top:10px;">
          <span class="badge">${guild.canManage ? "Manage Access" : "No Access"}</span>
          <span class="badge">${
            guild.hasBot === null ? "Bot Status Unknown" : guild.hasBot ? "Bot Added" : "Bot Missing"
          }</span>
          <span class="badge">${guild.source === "user" ? "Your Guild" : "Bot Guild"}</span>
        </div>
        <div class="guild-actions">
          <a class="btn" href="/guild.html?id=${encodeURIComponent(guild.id)}">Open</a>
        </div>
      </div>
    `).join("");
  } catch (error) {
    meBox.textContent = "Ошибка авторизации";
    guildsBox.innerHTML = `
      <div class="card">
        <h3>Ошибка</h3>
        <div class="muted">${escapeHtml(error.message)}</div>
      </div>
    `;
  }
})();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
