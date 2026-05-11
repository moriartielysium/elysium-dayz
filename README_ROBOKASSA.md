# ELYSIUM DAYZ — сайт под подключение Robokassa

Сайт полностью упрощён под публичную страницу проекта и требования платёжной системы: описание услуги, пакеты пополнения, контакты, реквизиты, оферта, политика конфиденциальности, условия возврата, страницы success/fail/result.

## Что нужно заменить перед публикацией

Открой файл:

```text
src/config.js
```

И замени значения:

```text
supportEmail
Discord-ссылку
domain
seller.legalName
seller.inn
seller.ogrnOrOgrnip
seller.address
seller.email
robokassa.successUrl
robokassa.failUrl
robokassa.resultUrl
```

Поля `УКАЖИТЕ ...` нельзя оставлять на публичном сайте. Robokassa может не принять магазин, если реквизиты и контакты не заполнены.

## Что указывать в Robokassa

Пример:

```text
Наименование магазина: ELYSIUM DAYZ
Идентификатор магазина: elysiumdayz
Ссылка на ресурс: https://elysium-dayz.ru
Описание товаров/услуг: Пополнение внутреннего баланса Discord-сообщества ELYSIUM DAYZ. Баланс используется внутри проекта для цифровых сервисов сервера. Услуга оказывается автоматически после подтверждения оплаты.
Категория: Цифровые товары и услуги / Развлечения / Онлайн-сервисы
Success URL: https://elysium-dayz.ru/pay/success
Fail URL: https://elysium-dayz.ru/pay/fail
Result URL: https://elysium-dayz.ru/pay/result
```

## Важно по Result URL

Страница `/pay/result` сейчас является только заглушкой. Для реального запуска автоматической выдачи валюты нужен backend-обработчик, который:

1. принимает уведомление Robokassa;
2. проверяет подпись платежа;
3. проверяет сумму и номер заказа;
4. не допускает повторного начисления;
5. начисляет баланс в базе бота;
6. отвечает Robokassa корректным `OK + InvId`.

Без этого нельзя запускать реальные автоматические платежи.

## Команды

```bash
npm install
npm run dev
npm run build
```

## Деплой на Netlify

В проекте уже есть `netlify.toml`:

```text
build command: npm run build
publish directory: dist
```
