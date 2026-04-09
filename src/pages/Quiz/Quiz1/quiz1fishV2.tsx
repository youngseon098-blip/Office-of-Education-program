import { Link } from "react-router-dom";

export default function Quiz1FishV2() {
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
                    to="/quiz1/fishv"
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
                    to="/quiz2"
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
