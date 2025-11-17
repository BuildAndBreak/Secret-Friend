import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VerifyPage from "./pages/VerifyPage.jsx";
import InvitePage from "./pages/InvitePage.jsx";
import HomePage from "./pages/HomePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/i/:token" element={<InvitePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
