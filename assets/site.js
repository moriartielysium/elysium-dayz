(function () {
  var year = document.querySelectorAll('[data-year]');
  for (var i = 0; i < year.length; i++) year[i].textContent = new Date().getFullYear();

  var cfg = window.ELYSIUM_CONFIG || {};
  var apiBase = String(cfg.apiBaseUrl || '').replace(/\/$/, '');
  var slug = String(cfg.guildSlug || 'elysium');
  var discordUrl = String(cfg.discordUrl || 'https://discord.gg/elysium');

  var discordLinks = document.querySelectorAll('[data-discord-url]');
  for (var d = 0; d < discordLinks.length; d++) discordLinks[d].setAttribute('href', discordUrl);

  function setStatus(message, type) {
    var box = document.querySelector('[data-payment-status]');
    if (!box) return;
    box.textContent = message || '';
    box.className = 'payment-status ' + (type || '');
    box.style.display = message ? 'block' : 'none';
  }

  function loginUrl() {
    var next = encodeURIComponent('/donate/');
    return apiBase + '/auth-login?next=' + next;
  }

  async function createPayment(packageId, button) {
    if (!apiBase) {
      setStatus('Перед запуском оплаты укажите backend URL в /assets/config.js, например https://api.elysium-dayz.site', 'warn');
      return;
    }

    var oldText = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'Создаю заказ...';
    }
    setStatus('Создаю заказ и платёжную ссылку...', 'info');

    try {
      var response = await fetch(apiBase + '/payments/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug, package_id: String(packageId) })
      });

      if (response.status === 401) {
        setStatus('Нужно войти через Discord. Сейчас перенаправляю на авторизацию...', 'warn');
        window.location.href = loginUrl();
        return;
      }

      var data = await response.json().catch(function () { return {}; });

      if (response.status === 403) {
        setStatus('Сначала привяжите PSN через /link в Discord, потом повторите оплату.', 'warn');
        return;
      }

      if (!response.ok || !data.ok || !data.paymentUrl) {
        setStatus((data && data.detail) ? data.detail : 'Не удалось создать платёж. Попробуйте позже или напишите в поддержку.', 'error');
        return;
      }

      setStatus('Заказ создан. Открываю Robokassa...', 'success');
      window.location.href = data.paymentUrl;
    } catch (error) {
      setStatus('Backend оплаты недоступен. Проверьте API адрес или попробуйте позже.', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = oldText;
      }
    }
  }

  var buttons = document.querySelectorAll('[data-pay-package]');
  for (var b = 0; b < buttons.length; b++) {
    buttons[b].addEventListener('click', function () {
      createPayment(this.getAttribute('data-pay-package'), this);
    });
  }
})();
