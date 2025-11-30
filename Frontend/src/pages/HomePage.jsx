import Form from "../components/Form.jsx";
import Footer from "../components/Footer.jsx";

export default function HomePage() {
  return (
    <div className="App">
      <main>
        <header>
          <h1 style={{ color: "var(--color-white)" }}>Secret Santa</h1>
        </header>
        <Form />
      </main>
      <Footer />
    </div>
  );
}
