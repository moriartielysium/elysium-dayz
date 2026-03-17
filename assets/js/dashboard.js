(async function initDashboard() {
  const meBox = document.getElementById("me");
  const guildsBox = document.getElementById("guilds");
  try {
    const user = await requireAuth();
    if (!user) return;
    meBox.textContent = `Вы вошли как ${user.username} (${user.id})`;
    const data = await apiGet("/api/guilds");
    const guilds = data.guilds || [];
    if (!guilds.length) {
      guildsBox.innerHTML = `<div class="card"><h3>Серверы не найдены</h3><div class="muted">Нет серверов с Manage Server или бот еще не синхронизирован в bot_guilds.</div></div>`;
      return;
    }
    guildsBox.innerHTML = guilds.map((guild) => `
      <div class="card">
        <h3>${escapeHtml(guild.name)}</h3>
        <div class="muted">Guild ID: ${guild.id}</div>
        <div style="margin-top:10px;">
          <span class="badge">${guild.canManage ? "Manage Access" : "No Access"}</span>
          <span class="badge">${guild.hasBot ? "Bot Added" : "Bot Missing"}</span>
        </div>
        <div class="guild-actions"><a class="btn" href="/guild.html?id=${encodeURIComponent(guild.id)}">Open</a></div>
      </div>`).join("");
  } catch (error) {
    guildsBox.innerHTML = `<div class="card"><h3>Ошибка загрузки dashboard</h3><div class="muted">${escapeHtml(error.message)}</div></div>`;
  }
})();
function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
