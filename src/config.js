export const siteConfig = {
  projectName: 'ELYSIUM DAYZ',
  shortName: 'ELYSIUM',
  serviceName: 'Пополнение внутреннего баланса Discord-сообщества ELYSIUM DAYZ',
  currencyName: 'внутренний баланс',
  supportEmail: 'support@elysium-dayz.ru',
  discordUrl: 'https://discord.gg/elysium',
  domain: 'https://elysium-dayz.ru',
  seller: {
    legalName: 'УКАЖИТЕ ФИО САМОЗАНЯТОГО / ИП / НАЗВАНИЕ ООО',
    inn: 'УКАЖИТЕ ИНН',
    ogrnOrOgrnip: 'УКАЖИТЕ ОГРН / ОГРНИП, если применимо',
    address: 'УКАЖИТЕ ЮРИДИЧЕСКИЙ / ПОЧТОВЫЙ АДРЕС',
    email: 'support@elysium-dayz.ru',
  },
  packages: [
    { rub: 100, balance: '10 000', label: 'Стартовый пакет' },
    { rub: 250, balance: '30 000', label: 'Популярный пакет' },
    { rub: 500, balance: '70 000', label: 'Лучший выбор' },
    { rub: 1000, balance: '160 000', label: 'Максимальный пакет' },
  ],
  robokassa: {
    merchantLogin: 'elysiumdayz',
    successUrl: 'https://elysium-dayz.ru/pay/success',
    failUrl: 'https://elysium-dayz.ru/pay/fail',
    resultUrl: 'https://elysium-dayz.ru/pay/result',
  },
};
