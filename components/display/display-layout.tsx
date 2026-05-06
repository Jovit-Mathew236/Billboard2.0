"use client";
import { useEffect, useState} from "react";
import localFont from "next/font/local";
import { Clock3, GraduationCap, Sun } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const geistSans = localFont({
  src: "../../app/fonts/GeistVF.woff",
  weight: "100 900",
});

// ─────────────────── Types ───────────────────
interface Settings {
  backgroundColor: string;
  headerText: string;
  title: string;
  backgroundImageUrl: string;
  logoText?: string;
  batchYear?: string;
  studentCount?: string;
  placements?: string;
  higherStudy?: string;
}

interface StaffPosition {
  position: string;
  count: string;
  icon?: string;
}

interface FacultyMember {
  id: string;
  name: string;
  specializedIn: string; // comma-separated degree tags e.g. "M.E, PhD"
}

interface NewsItem {
  uuid: string;
  title: string;
}

interface WeatherData {
  Temperature?: { Value: number };
  IconPhrase?: string;
  EpochDateTime?: number;
}

interface CarouselImage {
  id: string;
  imageUrl: string;
}

// ─────────────────── Helpers ───────────────────
const GRAD = "linear-gradient(160deg, #3b2fa0 0%, #5b3ec8 35%, #6d3bbd 60%, #4e2a9a 100%)";
const NEWS_TICKER_HEIGHT = "clamp(110px,14vw,125px)";

function WeatherTimePill() {
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/services/weather")
      .then((r) => r.json())
      .then((d) => setWeather(d?.[0] ?? null))
      .catch(() => { });
  }, []);

  const tempC = weather?.Temperature?.Value
    ? (((weather.Temperature.Value - 32) * 5) / 9).toFixed(0)
    : null;
  const condition = weather?.IconPhrase ?? "Clear";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "18px",
        background: "rgba(30,24,60,0.75)",
        backdropFilter: "blur(12px)",
        borderRadius: "999px",
        padding: "10px 28px",
        border: "1px solid rgba(255,255,255,0.15)",
        fontSize: "clamp(0.9rem, 2vw, 1.3rem)",
        color: "#fff",
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <Sun size={18} strokeWidth={2.25} />
        <span>{condition}{tempC ? ` · ${tempC}°C` : ""}</span>
      </span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <Clock3 size={18} strokeWidth={2.25} />
        <span>{time}</span>
      </span>
    </div>
  );
}

function StaffStatCard({ position, count }: StaffPosition) {
  const iconMap: Record<string, React.ReactNode> = {
    "PoP": <GraduationCap size={16} strokeWidth={2.25} />,
    "Asst Prof": <GraduationCap size={16} strokeWidth={2.25} />,
    "Asso Prof": <GraduationCap size={16} strokeWidth={2.25} />,
    "Technical Staff": <GraduationCap size={16} strokeWidth={2.25} />,
    "Professor": <GraduationCap size={16} strokeWidth={2.25} />,
    "HOD": <GraduationCap size={16} strokeWidth={2.25} />,
  };
  const icon = iconMap[position] ?? <GraduationCap size={16} strokeWidth={2.25} />;
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.15)",
        padding: "clamp(10px,2vw,20px) clamp(12px,2.5vw,28px)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: "clamp(0.7rem,1.8vw,1rem)", color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>
        <span>{position}</span>
      </div>
      <div style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {count}
      </div>
    </div>
  );
}

function DegreeBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "rgba(90,60,200,0.12)",
        border: "1px solid rgba(90,60,200,0.3)",
        borderRadius: "6px",
        padding: "2px 10px",
        fontSize: "clamp(0.55rem,1.3vw,0.85rem)",
        color: "#4a3aaa",
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label.trim()}
    </span>
  );
}

function FacultyCard({ members }: { members: FacultyMember[] }) {
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const totalPages = Math.ceil(members.length / PAGE_SIZE);

  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPage((p) => (p + 1) % totalPages);
        setFading(false);
      }, 500);
    }, 8000);
    return () => clearInterval(id);
  }, [totalPages]);

  const slice = members.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "clamp(14px,3vw,28px)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(8px,1.5vw,14px)",
        flex: 1,
        height: "100%",
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease",
      }}
    >
      {slice.map((m) => {
        const degrees = (m.specializedIn ?? "").split(",").filter(Boolean);
        return (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: "clamp(0.8rem,2.2vw,1.2rem)",
                fontWeight: 700,
                color: "#2d1fa3",
                lineHeight: 1.2,
              }}
            >
              {m.name}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {degrees.map((d, i) => (
                <DegreeBadge key={i} label={d} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NewsTickerBottom() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const load = () =>
      fetch("/api/services/news")
        .then((r) => r.json())
        .then((d) => setNews(d?.data ?? []))
        .catch(() => { });
    load();
    const id = setInterval(load, 300000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % Math.min(news.length, 10));
        setVisible(true);
      }, 800);
    }, 7000);
    return () => clearInterval(id);
  }, [news.length]);

  const headline = news[idx]?.title ?? "Loading latest news…";

  return (
    <div
      style={{
        height: "100%",
        background: "rgba(20,16,50,0.82)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "clamp(10px,2vw,18px) clamp(16px,3vw,32px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "clamp(0.8rem,2vw,1.15rem)",
        fontWeight: 500,
        textAlign: "center",
        lineHeight: 1.5,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s ease",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {headline}
    </div>
  );
}

function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: "1rem",
        }}
      >
        No image
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        width: "auto",
        maxWidth: "100%",
        aspectRatio: "3 / 4",
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.imageUrl}
          alt={`photo-${i}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            opacity: i === idx ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        />
      ))}
    </div>
  );
}

function DepartmentHighlights({
  batchYear,
  studentCount,
  placements,
  higherStudy,
}: {
  batchYear?: string;
  studentCount?: string;
  placements?: string;
  higherStudy?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "clamp(6px,1vw,10px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(6px,1vw,10px)",
        }}
      >
        <div
          style={{
            background: "rgba(30,20,80,0.75)",
            backdropFilter: "blur(10px)",
            borderRadius: "14px",
            padding: "clamp(8px,1.5vw,14px) clamp(10px,2vw,18px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ fontSize: "clamp(0.55rem,1.2vw,0.8rem)", color: "rgba(255,255,255,0.55)", marginBottom: "2px" }}>Batch</div>
          <div style={{ fontSize: "clamp(1rem,3vw,2rem)", fontWeight: 800, color: "#fff" }}>{batchYear ?? "—"}</div>
        </div>

        <div
          style={{
            background: "rgba(30,20,80,0.75)",
            backdropFilter: "blur(10px)",
            borderRadius: "14px",
            padding: "clamp(8px,1.5vw,14px) clamp(10px,2vw,18px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ fontSize: "clamp(0.55rem,1.2vw,0.8rem)", color: "rgba(255,255,255,0.55)", marginBottom: "2px" }}>No of Students</div>
          <div style={{ fontSize: "clamp(1rem,3vw,2rem)", fontWeight: 800, color: "#fff" }}>{studentCount ?? "—"}</div>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "clamp(8px,1.5vw,14px) clamp(12px,2vw,22px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "clamp(0.85rem,2.2vw,1.4rem)", fontWeight: 600, color: "#1a1a2e" }}>Placements</span>
        <span style={{ fontSize: "clamp(1.2rem,3.5vw,2.2rem)", fontWeight: 900, color: "#1a1a2e", borderLeft: "3px solid #1a1a2e", paddingLeft: "14px" }}>
          {placements ?? "—"}
        </span>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "clamp(8px,1.5vw,14px) clamp(12px,2vw,22px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "clamp(0.85rem,2.2vw,1.4rem)", fontWeight: 600, color: "#1a1a2e" }}>Higher Study</span>
        <span style={{ fontSize: "clamp(1.2rem,3.5vw,2.2rem)", fontWeight: 900, color: "#1a1a2e", borderLeft: "3px solid #1a1a2e", paddingLeft: "14px" }}>
          {higherStudy ?? "—"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────── Main Layout ───────────────────
export default function DisplayLayout() {
  const [settings, setSettings] = useState<Settings>({
    backgroundColor: "#3b2fa0",
    headerText: "Department of",
    title: "Electronics and Computer Engineering",
    backgroundImageUrl: "",
    logoText: "er",
    batchYear: "2021-2025",
    studentCount: "60",
    placements: "59",
    higherStudy: "3",
  });

  const [positions, setPositions] = useState<StaffPosition[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

  const displayTitle =
    settings.title?.trim().toUpperCase() === "ELECTRONICS AND COMPUTER ENGINEERING"
      ? "Electronics and Computer Engineering"
      : settings.title;

  // Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) setSettings((prev) => ({ ...prev, ...(snap.data() as Settings) }));
    });
    return unsub;
  }, []);

  // Staff positions
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "position")), (snap) => {
      setPositions(
        snap.docs.map((d) => ({
          position: d.data().position,
          count: d.data().count,
        }))
      );
    });
    return unsub;
  }, []);

  // Faculty
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "fields")), (snap) => {
      setFaculty(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          specializedIn: d.data().specializedIn ?? "",
        }))
      );
    });
    return unsub;
  }, []);

  // Carousel images
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "images")), (snap) => {
      setCarouselImages(
        snap.docs.map((d) => ({ id: d.id, imageUrl: d.data().imageUrl }))
      );
    });
    return unsub;
  }, []);

  return (
    <div
      className={`${geistSans.className} display-layout`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vh",
        height: "100vw",
        transform: "rotate(270deg)",
        transformOrigin: "center center",
        margin: "auto",
        right: 0,
        bottom: 0,
        background: settings.backgroundImageUrl
          ? `url(${settings.backgroundImageUrl}) center/cover no-repeat`
          : GRAD,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(12px,2.5vw,28px)",
        gap: "clamp(8px,1.5vw,16px)",
        letterSpacing: "-0.04em",
        fontKerning: "normal",
        boxSizing: "border-box",
      }}
    >
      {/* Dark overlay when bg image active */}
      {settings.backgroundImageUrl && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(30,15,80,0.6)", zIndex: 0 }} />
      )}

      {/* ── Row 1: Top bar ── */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 1, flexShrink: 0 }}>
        <WeatherTimePill />
      </div>

      {/* ── Row 2: Department Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(12px,2vw,24px)",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "clamp(2rem,6vw,4.5rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            flexShrink: 0,
          }}
        >
          {settings.logoText ?? "er"}
        </div>
        {/* Divider */}
        <div
          style={{
            width: "3px",
            height: "clamp(40px,8vw,80px)",
            background: "rgba(255,255,255,0.5)",
            borderRadius: "2px",
            flexShrink: 0,
          }}
        />
        {/* Text */}
        <div>
          <div style={{ fontSize: "clamp(0.75rem,2vw,1.2rem)", color: "rgba(255,255,255,0.8)", fontWeight: 500, marginBottom: "2px" }}>
            {settings.headerText}
          </div>
          <div
            style={{
              fontSize: "clamp(1.1rem,3.5vw,2.5rem)",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {displayTitle}
          </div>
        </div>
      </div>

      {/* ── Row 3: Staff Stats ── */}
      <div
        style={{
          display: "flex",
          gap: "clamp(8px,1.5vw,14px)",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        {positions.length > 0
          ? positions.map((p, i) => <StaffStatCard key={i} {...p} />)
          : ["PoP", "Asst Prof", "Asso Prof", "Technical Staff"].map((p) => (
            <StaffStatCard key={p} position={p} count="—" />
          ))}
      </div>

      {/* ── Row 4: Main Content ── */}
      <div
        style={{
          display: "flex",
          gap: "clamp(8px,1.5vw,14px)",
          alignItems: "stretch",
          flex: 1,
          minHeight: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left: Faculty list */}
        <div style={{ flex: "0 0 42%", minWidth: 0, minHeight: 0, height: "100%", display: "flex", alignSelf: "stretch" }}>
          <FacultyCard members={faculty} />
        </div>

        {/* Right: Photo + stats */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(2px,0.4vw,6px)",
            minWidth: 0,
            minHeight: 0,
            alignSelf: "stretch",
          }}
        >
          {/* Photo */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            <ImageCarousel images={carouselImages} />
          </div>

          <DepartmentHighlights
            batchYear={settings.batchYear}
            studentCount={settings.studentCount}
            placements={settings.placements}
            higherStudy={settings.higherStudy}
          />
        </div>
      </div>

      {/* ── Row 5: News Ticker ── */}
      <div style={{ position: "relative", zIndex: 0, flexShrink: 0, height: NEWS_TICKER_HEIGHT }}>
        <NewsTickerBottom />
      </div>
    </div>
  );
}
