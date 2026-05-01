export function formatMoney(value, currencyName = '') {
  const amount = new Intl.NumberFormat('ru-RU').format(Number(value || 0));
  const currency = String(currencyName || '').trim();
  if (!currency) return amount;
  if (['$', '€', '£', '¥'].includes(currency)) return `${currency}${amount}`;
  return `${amount} ${currency}`;
}
