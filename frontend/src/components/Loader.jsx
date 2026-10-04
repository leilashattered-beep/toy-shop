export default function Loader({ text = 'Загружаем…', size = 'lg' }) {
  return (
    <div className="loader-box">
      <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
      <span>{text}</span>
    </div>
  )
}
