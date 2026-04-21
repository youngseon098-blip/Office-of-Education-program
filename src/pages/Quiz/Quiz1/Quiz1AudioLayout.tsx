import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { playQuiz1Bgm, stopQuiz1Audio } from "./quiz1AudioController";

export default function Quiz1AudioLayout() {
  useEffect(() => {
    playQuiz1Bgm();

    return () => {
      stopQuiz1Audio();
    };
  }, []);

  return <Outlet />;
}
