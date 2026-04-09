import { Link } from "react-router-dom";

export default function QuizLab() {
    return (
        <main
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100dvh",
                margin: 0,
                padding: 0,
                overflow: "hidden",
                backgroundColor: "#07122a",
                backgroundImage: "url('/img/Quiz/Quiz1/lab.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "grid",
                placeItems: "center",
            }}
        >
            <section
                style={{
                    position: "absolute",
                    left: "56px",
                    top: "88px",
                    maxWidth: "min(620px, 68vw)",
                    color: "#f8fafc",
                    textShadow: "0 2px 12px rgba(0, 0, 0, 0.55)",
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                    fontSize: "22px",
                    fontWeight: 600,
                }}
            >
                {`[검찰일기 이대환 박사]

안녕하세요.
이규원 검찰일기를 연구하는 이대환박사입니다.
만나서 반갑습니다.

최근 울릉도에서 이상한 시그널이 계속해서 감지되고 있습니다.

확실한 건 현시대의 전화는 아닌...
마치 과거에서 온 그런 전화 같았습니다.

아! 여기 이 전화기를 들고가세요. 큰 도움이 될겁니다.`}
            </section>
            <img
                src="/img/Quiz/Quiz1/Doctor.webp"
                alt="의사 이미지"
                style={{
                    position: "absolute",
                    right: "0",
                    bottom: "0",
                    transform: "translateX(60px)",
                    width: "min(560px, 64vw)",
                    height: "auto",
                    borderRadius: "12px",
                }}
            />
            <nav
                aria-label="페이지 이동"
                style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "28px",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "14px",
                }}
            >
                <Link
                    to="/quiz1/intro"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        textDecoration: "none",
                        color: "#f8fafc",
                        background: "rgba(7, 18, 42, 0.7)",
                        border: "1px solid rgba(255, 255, 255, 0.28)",
                        backdropFilter: "blur(3px)",
                    }}
                >
                    <img
                        src="https://api.iconify.design/mdi/arrow-left.svg?color=%23f8fafc"
                        alt=""
                        width={18}
                        height={18}
                    />
                    이전
                </Link>
                <Link
                    to="/quiz1/call"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        textDecoration: "none",
                        color: "#f8fafc",
                        background: "rgba(7, 18, 42, 0.7)",
                        border: "1px solid rgba(255, 255, 255, 0.28)",
                        backdropFilter: "blur(3px)",
                    }}
                >
                    다음
                    <img
                        src="https://api.iconify.design/mdi/arrow-right.svg?color=%23f8fafc"
                        alt=""
                        width={18}
                        height={18}
                    />
                </Link>
            </nav>
        </main>
    );
}
