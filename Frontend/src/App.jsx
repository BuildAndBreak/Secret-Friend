import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VerifyPage from "./pages/VerifyPage.jsx";
import InvitePage from "./pages/InvitePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/i/:token" element={<InvitePage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
