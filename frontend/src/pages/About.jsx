import { Link } from 'react-router-dom'
import { IconGift, IconHeart, IconPaw, IconShield, IconSparkles, IconTruck } from '../components/Icons.jsx'

const VALUES = [
  {
    icon: IconHeart,
    title: 'Шьём вручную',
    text: 'Каждая игрушка собирается небольшими партиями: сначала выкройка, потом набивка, потом объятия для проверки мягкости.'
  },
  {
    icon: IconShield,
    title: 'Безопасные материалы',
    text: 'Плюш, хлопок, фетр и холлофайбер. Все ткани сертифицированы, игрушки можно стирать при 30 °C.'
  },
  {
    icon: IconTruck,
    title: 'Быстрая доставка',
    text: 'Собираем заказ в день оформления. По Кургану курьер привозит за 1 день, по России — 3–7 дней.'
  },
  {
    icon: IconGift,
    title: 'Подарочная упаковка',
    text: 'Крафт-коробка, атласная лента и открытка с вашим текстом — бесплатно к каждому заказу.'
  }
]

export default function About() {
  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>О магазине</span>
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">
              <IconSparkles size={15} /> О Softy
            </span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)' }}>
              Подарки, которые хочется обнять
            </h1>
            <p>
              Softy — небольшая мастерская мягких игрушек. Мы верим, что плюшевый друг — это не
              просто подарок, а тёплое воспоминание. Поэтому следим за каждой строчкой шва и
              выбираем только мягкие, безопасные материалы.
            </p>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h3>
              <IconPaw size={18} /> Как мы работаем
            </h3>
            <p className="muted">
              Каждую модель придумываем сами: рисуем эскиз, подбираем плюш по плотности и оттенку,
              тестируем набивку. Только после этого игрушка попадает в каталог.
            </p>
            <ul className="muted small" style={{ paddingLeft: 18 }}>
              <li>собственное производство в Кургане;</li>
              <li>партии по 20–40 штук, поэтому игрушки всегда «свежие»;</li>
              <li>бесплатный ремонт в течение года после покупки.</li>
            </ul>
          </div>
          <div className="card">
            <h3>Реквизиты и контакты</h3>
            <p className="muted small mb-0">
              ИП Мягкая Игрушка
              <br />
              г. Курган, ул. Плюшевая, 1
              <br />
              Телефон: +7 (900) 000-00-00
              <br />
              Email: hello@softy.local
              <br />
              Режим работы: ежедневно 10:00–20:00
            </p>
            <div className="chip-row mt-2">
              <span className="chip" style={{ cursor: 'default' }}>
                Доставка по России
              </span>
              <span className="chip" style={{ cursor: 'default' }}>
                Оплата онлайн и при получении
              </span>
              <span className="chip" style={{ cursor: 'default' }}>
                Возврат 14 дней
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-4 mt-3">
          {VALUES.map((value) => {
            const Icon = value.icon
            return (
              <article key={value.title} className="feature">
                <span className="feature-icon">
                  <Icon />
                </span>
                <div>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="banner mt-3">
          <div>
            <h2>Готовы выбрать своего?</h2>
            <p>В каталоге уже ждут медведи, капибары, лисы, аксолотли и другие мягкие друзья.</p>
          </div>
          <Link to="/catalog" className="btn btn-primary btn-lg">
            Смотреть каталог
          </Link>
        </div>
      </div>
    </div>
  )
}
