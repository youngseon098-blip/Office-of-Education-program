import Home from "./pages/Home";
import PantoneHome from "./pages/Pantone/PantoneHome";
import QuizHome from "./pages/Quiz/QuizHome";
import Quiz1 from "./pages/Quiz/Quiz1/quiz1";
import Quiz1Intro from "./pages/Quiz/Quiz1/quiz1Intro";
import QuizLab from "./pages/Quiz/Quiz1/quiz1Lab";
import Quiz1Call from "./pages/Quiz/Quiz1/quiz1call";
import Quiz1FishV from "./pages/Quiz/Quiz1/quiz1fishV";
import Quiz1FishV2 from "./pages/Quiz/Quiz1/quiz1fishV2";
import Quiz1FishV3 from "./pages/Quiz/Quiz1/quiz1fishV3";
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
      <Route path="/quiz1/lab" element={<QuizLab />} />
      <Route path="/quiz1/call" element={<Quiz1Call />} />
      <Route path="/quiz1/fishv" element={<Quiz1FishV />} />
      <Route path="/quiz1/fishv2" element={<Quiz1FishV2 />} />
      <Route path="/quiz1/fishv3" element={<Quiz1FishV3 />} />
      <Route path="/quiz2" element={<Quiz2 />} />
      <Route path="/quiz3" element={<Quiz3 />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
