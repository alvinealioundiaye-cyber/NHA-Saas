export default function Soon({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h2>{title}</h2>
      <div className="card">
        <p>{text}</p>
        <p className="muted">Ce module sera construit à la prochaine étape.</p>
      </div>
    </>
  )
}
