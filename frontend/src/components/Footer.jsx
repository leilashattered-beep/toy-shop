import { Link } from 'react-router-dom'
import { IconChat, IconMail, IconMapPin, IconPhone } from './Icons.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo">
              <span className="logo-mark">
                <img src="/images/bunny-logo.png" alt="" />
              </span>
              <span>
                Softy
                <small>мягкие игрушки</small>
              </span>
            </Link>
            <p className="muted small mt-2">
              Мастерская уютных игрушек. Шьём из гипоаллергенных материалов, доставляем по всей
              России.
            </p>
            <div className="row wrap">
              <span className="chip" style={{ cursor: 'default' }}>
                <IconChat size={16} /> Онлайн-поддержка
              </span>
              <span className="chip" style={{ cursor: 'default' }}>
                <IconMapPin size={16} /> Курган
              </span>
            </div>
          </div>

          <div>
            <h4>Магазин</h4>
            <ul>
              <li>
                <Link to="/catalog">Каталог</Link>
              </li>
              <li>
                <Link to="/categories">Категории</Link>
              </li>
              <li>
                <Link to="/cart">Корзина</Link>
              </li>
              <li>
                <Link to="/checkout">Оформление заказа</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Покупателю</h4>
            <ul>
              <li>
                <Link to="/login">Вход</Link>
              </li>
              <li>
                <Link to="/register">Регистрация</Link>
              </li>
              <li>
                <Link to="/account/orders">Мои заказы</Link>
              </li>
              <li>
                <Link to="/about">О магазине</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Контакты</h4>
            <ul>
              <li className="row">
                <IconPhone size={16} /> +7 (900) 000-00-00
              </li>
              <li className="row">
                <IconMail size={16} /> hello@softy.local
              </li>
              <li className="row">
                <IconMapPin size={16} /> г. Курган, ул. Плюшевая, 1
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Softy. Мягкие игрушки ручной работы.</span>
          <span>Сделано с любовью на React + Laravel + MySQL</span>
        </div>
      </div>
    </footer>
  )
}
