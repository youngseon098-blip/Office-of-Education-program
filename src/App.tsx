import Home from "./pages/Home";
import PantoneHome from "./pages/Pantone/PantoneHome";
import QuizHome from "./pages/Quiz/QuizHome";
import Quiz1 from "./pages/Quiz/Quiz1/quiz1";
import Quiz1Game from "./pages/Quiz/Quiz1/quiz1Game";
import Quiz2 from "./pages/Quiz/Quiz2/quiz2";
import Quiz3 from "./pages/Quiz/Quiz3/quiz3";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pantone" element={<PantoneHome />} />
      <Route path="/quiz" element={<QuizHome />} />
      <Route path="/quiz1" element={<Quiz1 />} />
      <Route path="/quiz1/game" element={<Quiz1Game />} />
      <Route path="/quiz2" element={<Quiz2 />} />
      <Route path="/quiz3" element={<Quiz3 />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
