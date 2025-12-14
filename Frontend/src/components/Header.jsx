import "./Header.css";

export default function Header() {
  return (
    <header>
      <h1>Secret Santa</h1>
      <img
        src="/assets/images/gold-star.png"
        width={120}
        alt=""
        aria-hidden="true"
      />
    </header>
  );
}
