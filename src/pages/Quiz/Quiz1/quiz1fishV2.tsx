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
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% - 7vh))",
          width: "100%",
          maxHeight: "calc(100dvh - 110px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          overflow: "visible",
          zIndex: 1,
          pointerEvents: "none",
          boxSizing: "border-box",
        }}
      >
        <img
          src="/img/Quiz/Quiz1/Fisherman2.webp"
          alt="어부 이미지"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            flexShrink: 0,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        <section
          aria-label="어부 대사"
          style={{
            flexShrink: 0,
            width: "min(640px, 92vw)",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "calc(-14vh - 44px - clamp(0px, 14vw - 72px, 220px))",
            padding: "0 24px 88px",
            maxHeight: "calc(100dvh - min(38vw, 360px) - 120px)",
            minHeight: 0,
            overflowY: "auto",
            color: "#f8fafc",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.55)",
            whiteSpace: "pre-line",
            lineHeight: 1.7,
            fontSize: "clamp(17px, 2.8vw, 24px)",
            fontWeight: 600,
            textAlign: "center",
            pointerEvents: "auto",
          }}
        >
          {`나라에서 울릉도로 사람들을 싹 모은다 캐서,
나도 큰맘 묵고 여그까지 기어들어 오기는 했는디

막상 발을 디뎌본께 이게 머시당가? 온 천지 쪽바리 놈들뿐이여.
아주 징허게 많구만 내 미래 양반들헌테 부탁 하나만 함세

쪽바리 놈들이 `}
          <span
            style={{
              fontWeight: 900,
              fontSize: "28px",
              lineHeight: 1.25,
              paddingBottom: "6px",
              backgroundImage:
                "linear-gradient(90deg, rgba(248, 250, 252, 0.0), rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0.0))",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 calc(100% - 1px)",
              backgroundSize: "100% 4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
            }}
          >
            내가 있는 장소
          </span>
          {`를 알면 곤란하니까 내 요놈들
몰래 힌트를 하나 남겨 줄랑께 잘 들어보쇼잉`}
        </section>
      </div>
      <nav
        aria-label="페이지 이동"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "28px",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "14px",
          zIndex: 2,
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
          to="/quiz1/fishv3"
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
