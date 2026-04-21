import Home from "./pages/Home";
import PantoneHome from "./pages/Pantone/PantoneHome";
import QuizHome from "./pages/Quiz/QuizHome";
import Quiz1 from "./pages/Quiz/Quiz1/quiz1";
import Quiz1Game from "./pages/Quiz/Quiz1/quiz1Game";
import Quiz1AudioLayout from "./pages/Quiz/Quiz1/Quiz1AudioLayout";
import Quiz2 from "./pages/Quiz/Quiz2/quiz2";
import Quiz2Game from "./pages/Quiz/Quiz2/quiz2Game";
import Quiz3 from "./pages/Quiz/Quiz3/quiz3";
import UcQuiz from "./pages/UcQuiz/UcQuiz";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pantone" element={<PantoneHome />} />
      <Route path="/quiz" element={<QuizHome />} />
      <Route path="/quiz1" element={<Quiz1AudioLayout />}>
        <Route index element={<Quiz1 />} />
        <Route path="game" element={<Quiz1Game />} />
      </Route>
      <Route path="/quiz2" element={<Quiz2 />} />
      <Route path="/quiz2/game" element={<Quiz2Game />} />
      <Route path="/quiz3" element={<Quiz3 />} />
      <Route path="/ucquiz" element={<UcQuiz />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
