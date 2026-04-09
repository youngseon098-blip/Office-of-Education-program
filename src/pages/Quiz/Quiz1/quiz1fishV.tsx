import { Link } from "react-router-dom";

export default function Quiz1FishV() {
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
            }}
        >
            <img
                src="/img/Quiz/Quiz1/fishV.webp"
                alt=""
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: "130vw",
                    height: "130dvh",
                    objectFit: "cover",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            />
            <img
                src="/img/Quiz/Quiz1/Fisherman.webp"
                alt="어부 이미지"
                style={{
                    position: "absolute",
                    left: "0",
                    bottom: "0",
                    width: "min(460px, 52vw)",
                    height: "auto",
                    zIndex: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            />
            <section
                style={{
                    position: "absolute",
                    right: "48px",
                    top: "92px",
                    maxWidth: "min(620px, 64vw)",
                    color: "#f8fafc",
                    textShadow: "0 2px 12px rgba(0, 0, 0, 0.55)",
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                    fontSize: "26px",
                    fontWeight: 600,
                    textAlign: "right",
                    zIndex: 1,
                }}
            >
                {`아.아. 들리오? 반갑소잉.
거까지 내 목소리가 들리니 참으로 신기허구만.

나야 평생 괴기나 잡고 살았지마는 이렇게
미래 양반들하고 노가리도 까보고
이거 원 오래 살고 볼일이구먼.`}
            </section>
            <nav
                aria-label="페이지 이동"
                style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "28px",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "14px",
                    zIndex: 1,
                }}
            >
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
                    <img
                        src="https://api.iconify.design/mdi/arrow-left.svg?color=%23f8fafc"
                        alt=""
                        width={18}
                        height={18}
                    />
                    이전
                </Link>
                <Link
                    to="/quiz1/fishv2"
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
