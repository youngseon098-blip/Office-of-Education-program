import Home from "./pages/Home";
import PantoneHome from "./pages/Pantone/PantoneHome";
import QuizHome from "./pages/Quiz/QuizHome";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pantone" element={<PantoneHome />} />
      <Route path="/quiz" element={<QuizHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
