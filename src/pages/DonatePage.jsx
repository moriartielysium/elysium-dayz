import { Card, Layout, SectionTitle } from '../components/Layout';
import { siteConfig } from '../config';

export default function DonatePage() {
  return (
    <Layout>
      <SectionTitle eyebrow="Пополнение" title="Пакеты внутреннего баланса">
        Выберите пакет в Discord-сообществе ELYSIUM DAYZ. После подключения Robokassa игрок будет получать платёжную ссылку, а начисление будет выполняться автоматически после подтверждения оплаты.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {siteConfig.packages.map((pack) => (
          <Card key={pack.rub} className={pack.rub === 500 ? 'border-red-500/50 shadow-glow' : ''}>
            <div className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-red-300">{pack.label}</div>
            <div className="text-3xl font-black text-white">{pack.rub} ₽</div>
            <div className="mt-2 text-lg font-bold text-amber-200">{pack.balance} $ баланса</div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Начисление производится на Discord-аккаунт игрока, который оформил заказ в боте.
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black text-white">Как использовать</h2>
          <ol className="mt-5 space-y-4 text-zinc-300">
            <li><strong>1.</strong> Зайдите на Discord-сервер ELYSIUM DAYZ.</li>
            <li><strong>2.</strong> Откройте команду или раздел пополнения у бота.</li>
            <li><strong>3.</strong> Выберите пакет и перейдите по платёжной ссылке.</li>
            <li><strong>4.</strong> После успешной оплаты дождитесь сообщения от бота о начислении.</li>
          </ol>
        </Card>
        <Card>
          <h2 className="text-2xl font-black text-white">Технические страницы оплаты</h2>
          <div className="mt-5 space-y-3 text-sm text-zinc-300">
            <div><span className="text-zinc-500">Success URL:</span> <code>{siteConfig.robokassa.successUrl}</code></div>
            <div><span className="text-zinc-500">Fail URL:</span> <code>{siteConfig.robokassa.failUrl}</code></div>
            <div><span className="text-zinc-500">Result URL:</span> <code>{siteConfig.robokassa.resultUrl}</code></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-amber-200">
            Result URL должен быть подключён к backend-обработчику оплаты перед запуском реальных платежей.
          </p>
        </Card>
      </div>
    </Layout>
  );
}
