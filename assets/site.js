(function () {
  var year = document.querySelectorAll('[data-year]');
  for (var i = 0; i < year.length; i++) year[i].textContent = new Date().getFullYear();
  var cfg = window.ELYSIUM_CONFIG || {};
  var discordUrl = String(cfg.discordUrl || 'https://discord.gg/elysium-dayz');
  var discordLinks = document.querySelectorAll('[data-discord-url]');
  for (var d = 0; d < discordLinks.length; d++) discordLinks[d].setAttribute('href', discordUrl);
})();
