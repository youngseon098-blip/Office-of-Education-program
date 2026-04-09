import Home from "./pages/Home";
import PantoneHome from "./pages/Pantone/PantoneHome";
import QuizHome from "./pages/Quiz/QuizHome";
import Quiz1 from "./pages/Quiz/Quiz1/quiz1";
import Quiz1Intro from "./pages/Quiz/Quiz1/quizIntro";
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
      <Route path="/quiz1/intro" element={<Quiz1Intro />} />
      <Route path="/quiz2" element={<Quiz2 />} />
      <Route path="/quiz3" element={<Quiz3 />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
