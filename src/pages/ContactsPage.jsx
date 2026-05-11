import { Card, Layout, SectionTitle } from '../components/Layout';
import { siteConfig } from '../config';

export default function ContactsPage() {
  return (
    <Layout compact>
      <SectionTitle eyebrow="Контакты" title="Поддержка и реквизиты">
        Здесь указаны контакты проекта и данные продавца для подключения платёжной системы. Перед публикацией замените все поля «УКАЖИТЕ» на реальные данные.
      </SectionTitle>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-2xl font-black text-white">Поддержка пользователей</h2>
          <div className="space-y-3 text-zinc-300">
            <p><strong>Email:</strong> <a className="text-red-300 hover:text-red-200" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a></p>
            <p><strong>Discord:</strong> <a className="text-red-300 hover:text-red-200" href={siteConfig.discordUrl} target="_blank" rel="noreferrer">перейти на сервер</a></p>
            <p><strong>Вопросы:</strong> начисления, ошибки оплаты, возвраты, доступ к заказам.</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-2xl font-black text-white">Реквизиты продавца</h2>
          <div className="space-y-3 text-zinc-300">
            <p><strong>Наименование:</strong> {siteConfig.seller.legalName}</p>
            <p><strong>ИНН:</strong> {siteConfig.seller.inn}</p>
            <p><strong>ОГРН / ОГРНИП:</strong> {siteConfig.seller.ogrnOrOgrnip}</p>
            <p><strong>Адрес:</strong> {siteConfig.seller.address}</p>
            <p><strong>Email:</strong> {siteConfig.seller.email}</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
