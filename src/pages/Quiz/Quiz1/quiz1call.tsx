import { type PointerEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Quiz1Call() {
    const navigate = useNavigate();
    const [slideX, setSlideX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [maxSlide, setMaxSlide] = useState(120);
    const startXRef = useRef<number | null>(null);
    const startSlideRef = useRef(0);
    const trackRef = useRef<HTMLElement | null>(null);
    const handleRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const updateMaxSlide = () => {
            if (!trackRef.current || !handleRef.current) return;
            const trackRect = trackRef.current.getBoundingClientRect();
            const handleRect = handleRef.current.getBoundingClientRect();
            const room = Math.max(0, trackRect.right - handleRect.right - 10);
            setMaxSlide(room);
            setSlideX((prev) => Math.min(prev, room));
        };

        updateMaxSlide();
        window.addEventListener("resize", updateMaxSlide);
        return () => window.removeEventListener("resize", updateMaxSlide);
    }, []);

    const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
        setIsDragging(true);
        startXRef.current = e.clientX;
        startSlideRef.current = slideX;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
        if (!isDragging || startXRef.current === null) return;
        const moved = e.clientX - startXRef.current;
        const next = Math.max(0, Math.min(maxSlide, startSlideRef.current + moved));
        setSlideX(next);
    };

    const handlePointerUp = () => {
        const reachedEnd = maxSlide > 0 && slideX >= maxSlide * 0.95;
        setIsDragging(false);
        startXRef.current = null;
        if (reachedEnd) {
            navigate("/quiz1/fishv");
            return;
        }
        setSlideX(0);
    };
    const slideProgress = maxSlide > 0 ? Math.min(1, slideX / maxSlide) : 0;
    const textOpacity = 1 - slideProgress;

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
                backgroundImage: "url('/img/Quiz/Quiz1/callBG.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "grid",
                placeItems: "center",
            }}
        >
            <section
                aria-label="통화 슬라이드 영역"
                ref={trackRef}
                style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "166px",
                    transform: "translateX(-50%)",
                    width: "min(480px, 84vw)",
                    height: "clamp(110px, 16vw, 150px)",
                    borderRadius: "999px",
                    background: "#78818c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000000",
                    fontSize: "clamp(22px, 4.8vw, 42px)",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                }}
            >
                <button
                    type="button"
                    ref={handleRef}
                    aria-label="통화 아이콘 드래그"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                        position: "absolute",
                        left: "clamp(6px, 1vw, 12px)",
                        top: "50%",
                        width: "auto",
                        height: "88%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        cursor: isDragging ? "grabbing" : "grab",
                        touchAction: "none",
                    }}
                >
                    <img
                        src="/img/Quiz/Quiz1/callicon.webp"
                        alt=""
                        style={{
                            width: "auto",
                            height: "100%",
                            objectFit: "contain",
                            transform: `translate(${slideX}px, 0)`,
                            transition: isDragging
                                ? "none"
                                : "transform 460ms cubic-bezier(0.2, 1.2, 0.2, 1)",
                            pointerEvents: "none",
                        }}
                    />
                </button>
                <span
                    style={{
                        transform: "translateX(clamp(30px, 6vw, 84px))",
                        display: "inline-block",
                        opacity: textOpacity,
                        transition: isDragging ? "none" : "opacity 220ms ease",
                    }}
                >
                    밀어서 통화하기
                </span>
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
                }}
            >
                <Link
                    to="/quiz1/lab"
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
            </nav>
        </main>
    );
}
