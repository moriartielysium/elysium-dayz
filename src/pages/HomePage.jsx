import { Link } from 'react-router-dom';
import { Card, Layout, SectionTitle } from '../components/Layout';
import { siteConfig } from '../config';

const steps = [
  ['1', 'Вы выбираете пакет', 'Пакеты и стоимость указаны заранее на сайте и в Discord.'],
  ['2', 'Оплачиваете заказ', 'После подключения Robokassa оплата будет проходить по защищённой платёжной ссылке.'],
  ['3', 'Получаете баланс', 'После подтверждения оплаты бот начисляет внутренний баланс на аккаунт Discord.'],
];

export default function HomePage() {
  return (
    <Layout>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <SectionTitle eyebrow="Официальная страница проекта" title="ELYSIUM DAYZ — пополнение внутреннего баланса">
            Внутренний баланс используется участниками Discord-сообщества ELYSIUM DAYZ для цифровых сервисов сервера.
            Оплата и правила оказания услуги описаны открыто, чтобы игрок заранее понимал стоимость, порядок выдачи и условия возврата.
          </SectionTitle>
          <div className="flex flex-wrap gap-3">
            <Link to="/donate" className="rounded-2xl bg-red-600 px-5 py-3 font-bold text-white shadow-glow transition hover:bg-red-500">
              Смотреть пакеты
            </Link>
            <a href={siteConfig.discordUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/15 px-5 py-3 font-bold text-white transition hover:bg-white/10">
              Перейти в Discord
            </a>
          </div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-red-600/20 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-200">
              Цифровая услуга
            </div>
            <h2 className="text-2xl font-black text-white">Что получает игрок</h2>
            <ul className="mt-5 space-y-4 text-zinc-300">
              <li className="flex gap-3"><span className="text-red-400">●</span><span>Пополнение внутреннего баланса Discord-сообщества.</span></li>
              <li className="flex gap-3"><span className="text-red-400">●</span><span>Автоматическую выдачу после подтверждения оплаты.</span></li>
              <li className="flex gap-3"><span className="text-red-400">●</span><span>Поддержку при технических ошибках начисления.</span></li>
              <li className="flex gap-3"><span className="text-red-400">●</span><span>Понятные условия использования, отмены и возврата.</span></li>
            </ul>
          </div>
        </Card>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        {steps.map(([number, title, text]) => (
          <Card key={number}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-lg font-black text-white">{number}</div>
            <h3 className="mb-2 text-xl font-black text-white">{title}</h3>
            <p className="text-sm leading-6 text-zinc-400">{text}</p>
          </Card>
        ))}
      </section>

      <section className="mt-14 rounded-3xl border border-red-500/20 bg-red-950/20 p-6 md:p-8">
        <h2 className="text-2xl font-black text-white">Важная информация</h2>
        <p className="mt-3 max-w-4xl text-zinc-300">
          Внутренний баланс не является электронными деньгами, не имеет самостоятельной денежной ценности и не предназначен для вывода обратно в реальные деньги.
          Он используется только внутри Discord-сообщества ELYSIUM DAYZ для доступа к цифровым сервисам проекта.
        </p>
      </section>
    </Layout>
  );
}
