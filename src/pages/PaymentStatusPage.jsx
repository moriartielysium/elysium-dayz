import { Link } from 'react-router-dom';
import { Card, Layout } from '../components/Layout';
import { siteConfig } from '../config';

export default function PaymentStatusPage({ status }) {
  const success = status === 'success';
  const result = status === 'result';

  let title = 'Платёж не завершён';
  let text = 'Оплата была отменена или не прошла. Попробуйте снова или обратитесь в поддержку.';
  let accent = 'text-red-300';

  if (success) {
    title = 'Оплата успешно завершена';
    text = 'Если платёж подтверждён системой, Discord-бот автоматически начислит внутренний баланс. Обычно это занимает несколько секунд.';
    accent = 'text-emerald-300';
  }

  if (result) {
    title = 'Технический адрес Result URL';
    text = 'Эта страница зарезервирована для серверной обработки уведомлений Robokassa. Для реального запуска оплат сюда нужно подключить backend, который проверяет подпись платежа и начисляет баланс.';
    accent = 'text-amber-300';
  }

  return (
    <Layout compact>
      <Card className="text-center">
        <div className={`mb-3 text-sm font-bold uppercase tracking-[0.28em] ${accent}`}>{siteConfig.projectName}</div>
        <h1 className="text-3xl font-black text-white md:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-zinc-300">{text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/donate" className="rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-500">Вернуться к пакетам</Link>
          <a href={`mailto:${siteConfig.supportEmail}`} className="rounded-2xl border border-white/15 px-5 py-3 font-bold text-white hover:bg-white/10">Написать в поддержку</a>
        </div>
      </Card>
    </Layout>
  );
}
