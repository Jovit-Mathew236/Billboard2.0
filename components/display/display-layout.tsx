"use client";
import { useEffect, useState } from "react";
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

interface BatchEntry {
  id: string;
  batchYear: string;
  studentCount: string;
  placements: string;
  higherStudy: string;
  order?: number;
}

interface StaffPosition {
  position: string;
  count: string;
  icon?: string;
}

interface FacultyMember {
  id: string;
  name: string;
  specializedIn: string;
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

// ─────────────────── Gradient ───────────────────
const GRAD =
  "linear-gradient(160deg, #3b2fa0 0%, #5b3ec8 35%, #6d3bbd 60%, #4e2a9a 100%)";

// ─────────────────── WeatherTimePill ───────────────────
// All sizes in vh: container width = 100vh, so 1vh = 1% of display width.
// This makes everything scale proportionally at any resolution (4K = 2× 1080p).
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
      .catch(() => {});
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
        gap: "2.9vh",
        background: "rgba(30,24,60,0.72)",
        backdropFilter: "blur(14px)",
        borderRadius: 999,
        padding: "1.4vh 3.9vh",
        border: "1px solid rgba(255,255,255,0.18)",
        fontSize: "2.4vh",
        color: "#fff",
        fontWeight: 500,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "1.1vh" }}>
        <Sun style={{ width: "2.5vh", height: "2.5vh" }} strokeWidth={2.25} />
        <span>{condition}{tempC ? ` · ${tempC}°C` : ""}</span>
      </span>
      <span style={{ opacity: 0.35 }}>|</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "1.1vh" }}>
        <Clock3 style={{ width: "2.5vh", height: "2.5vh" }} strokeWidth={2.25} />
        <span>{time}</span>
      </span>
    </div>
  );
}

// ─────────────────── StaffStatCard ───────────────────
function StaffStatCard({ position, count }: StaffPosition) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.13)",
        backdropFilter: "blur(10px)",
        borderRadius: "2.2vh",
        border: "1px solid rgba(255,255,255,0.16)",
        padding: "1.9vh 2.5vh",
        display: "flex",
        flexDirection: "column",
        gap: "0.85vh",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "1.8vh",
          color: "rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          gap: "0.85vh",
          whiteSpace: "nowrap",
        }}
      >
        <GraduationCap style={{ width: "1.9vh", height: "1.9vh" }} strokeWidth={2.25} />
        <span>{position}</span>
      </div>
      <div style={{ fontSize: "5.8vh", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {count}
      </div>
    </div>
  );
}

// ─────────────────── DegreeBadge ───────────────────
function DegreeBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "rgba(90,60,200,0.12)",
        border: "1px solid rgba(90,60,200,0.28)",
        borderRadius: "0.85vh",
        padding: "0.3vh 1.25vh",
        fontSize: "1.5vh",
        color: "#4a3aaa",
        fontWeight: 600,
        lineHeight: 1.5,
        whiteSpace: "nowrap",
      }}
    >
      {label.trim()}
    </span>
  );
}

// ─────────────────── FacultyCard ───────────────────
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
        borderRadius: "2.75vh",
        padding: "2.75vh 3vh",
        display: "flex",
        flexDirection: "column",
        gap: "1.4vh",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease",
      }}
    >
      {slice.map((m) => {
        const degrees = (m.specializedIn ?? "").split(",").filter(Boolean);
        return (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: "0.55vh" }}>
            <div style={{ fontSize: "2.35vh", fontWeight: 700, color: "#2d1fa3", lineHeight: 1.2 }}>
              {m.name}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55vh" }}>
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

// ─────────────────── ImageCarousel ───────────────────
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
          borderRadius: "1.85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: "1.4vh",
        }}
      >
        No image
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "1.85vh",
        overflow: "hidden",
        background: "#e8e8ee",
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
            objectPosition: "center center",
            opacity: i === idx ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────── DepartmentHighlights ───────────────────
function DepartmentHighlights({
  batches,
  fallback,
}: {
  batches: BatchEntry[];
  fallback: { batchYear?: string; studentCount?: string; placements?: string; higherStudy?: string };
}) {
  const entries =
    batches.length > 0
      ? batches
      : [
          {
            id: "__fallback__",
            batchYear: fallback.batchYear ?? "—",
            studentCount: fallback.studentCount ?? "—",
            placements: fallback.placements ?? "—",
            higherStudy: fallback.higherStudy ?? "—",
          },
        ];

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (entries.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % entries.length);
        setVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const current = entries[idx] ?? entries[0];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.1vh",
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease",
      }}
    >
      {/* Batch indicator dots */}
      {entries.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.6vh" }}>
          {entries.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? "1.8vh" : "0.7vh",
                height: "0.7vh",
                borderRadius: "999px",
                background: i === idx ? "#fff" : "rgba(255,255,255,0.35)",
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1vh" }}>
        <div style={{ background: "rgba(20,14,60,0.82)", backdropFilter: "blur(10px)", borderRadius: "1.9vh", padding: "1.4vh 1.9vh", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "1.3vh", color: "rgba(255,255,255,0.5)", marginBottom: "0.42vh", letterSpacing: "0.04em" }}>Batch</div>
          <div style={{ fontSize: "3vh", fontWeight: 800, color: "#fff" }}>{current.batchYear}</div>
        </div>
        <div style={{ background: "rgba(20,14,60,0.82)", backdropFilter: "blur(10px)", borderRadius: "1.9vh", padding: "1.4vh 1.9vh", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "1.3vh", color: "rgba(255,255,255,0.5)", marginBottom: "0.42vh", letterSpacing: "0.04em" }}>No of Students</div>
          <div style={{ fontSize: "3vh", fontWeight: 800, color: "#fff" }}>{current.studentCount}</div>
        </div>
      </div>
      <div style={{ background: "#ffffff", borderRadius: "1.9vh", padding: "1.4vh 2.2vh", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "2.35vh", fontWeight: 600, color: "#1a1a2e" }}>Placements</span>
        <span style={{ fontSize: "3.3vh", fontWeight: 900, color: "#1a1a2e", borderLeft: "0.42vh solid #1a1a2e", paddingLeft: "1.9vh" }}>{current.placements}</span>
      </div>
      <div style={{ background: "#ffffff", borderRadius: "1.9vh", padding: "1.4vh 2.2vh", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "2.35vh", fontWeight: 600, color: "#1a1a2e" }}>Higher Study</span>
        <span style={{ fontSize: "3.3vh", fontWeight: 900, color: "#1a1a2e", borderLeft: "0.42vh solid #1a1a2e", paddingLeft: "1.9vh" }}>{current.higherStudy}</span>
      </div>
    </div>
  );
}

// ─────────────────── NewsTicker ───────────────────
function NewsTickerBottom() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const load = () =>
      fetch("/api/services/news")
        .then((r) => r.json())
        .then((d) => setNews(d?.data ?? []))
        .catch(() => {});
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
        width: "100%",
        height: "100%",
        background: "rgba(18,14,48,0.85)",
        backdropFilter: "blur(14px)",
        borderRadius: "2.2vh",
        padding: "0 3.9vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "2.2vh",
        fontWeight: 500,
        textAlign: "center",
        lineHeight: 1.55,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s ease",
        border: "1px solid rgba(255,255,255,0.1)",
        boxSizing: "border-box",
      }}
    >
      {headline}
    </div>
  );
}

// ─────────────────── Main Layout ───────────────────
export default function DisplayLayout() {
  const [settings, setSettings] = useState<Settings>({
    backgroundColor: "#3b2fa0",
    headerText: "Department of",
    title: "Electronics & Computer Engineering",
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
  const [batches, setBatches] = useState<BatchEntry[]>([]);

  const displayTitle =
    settings.title?.trim().toUpperCase() === "ELECTRONICS AND COMPUTER ENGINEERING"
      ? "Electronics & Computer Engineering"
      : settings.title;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) setSettings((prev) => ({ ...prev, ...(snap.data() as Settings) }));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "position")), (snap) => {
      setPositions(snap.docs.map((d) => ({ position: d.data().position, count: d.data().count })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "fields")), (snap) => {
      setFaculty(
        snap.docs.map((d) => ({ id: d.id, name: d.data().name, specializedIn: d.data().specializedIn ?? "" }))
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "images")), (snap) => {
      setCarouselImages(snap.docs.map((d) => ({ id: d.id, imageUrl: d.data().imageUrl })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "batches")), (snap) => {
      const entries = snap.docs
        .map((d) => ({
          id: d.id,
          batchYear: d.data().batchYear ?? "—",
          studentCount: d.data().studentCount ?? "—",
          placements: d.data().placements ?? "—",
          higherStudy: d.data().higherStudy ?? "—",
          order: d.data().order ?? 0,
        }))
        .sort((a, b) => a.order - b.order);
      setBatches(entries);
    });
    return unsub;
  }, []);

  return (
    <div
      className={geistSans.className}
      style={{
        /* Rotated billboard: landscape screen displayed as portrait.
           width:100vh = screen height = display width after rotation.
           All vh units inside scale proportionally at any resolution. */
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        margin: "auto",
        width: "100vh",
        height: "100vw",
        transform: "rotate(270deg)",
        transformOrigin: "center center",
        background: settings.backgroundImageUrl
          ? `url(${settings.backgroundImageUrl}) center/cover no-repeat`
          : GRAD,
        overflow: "hidden",
        boxSizing: "border-box",
        letterSpacing: "-0.03em",
        display: "flex",
        flexDirection: "column",
        padding: "2.9vh",
        gap: "1.7vh",
      }}
    >
      {settings.backgroundImageUrl && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(28,14,72,0.58)", zIndex: 0 }} />
      )}

      {/* ── Row 1: Weather / Time pill ── */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 1, flexShrink: 0 }}>
        <WeatherTimePill />
      </div>

      {/* ── Row 2: Logo + Department name ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2.9vh",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "8.4vh",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: "-0.05em",
            flexShrink: 0,
          }}
        >
          {settings.logoText ?? "er"}
        </div>

        <div
          style={{
            width: "0.42vh",
            height: "9.6vh",
            background: "rgba(255,255,255,0.45)",
            borderRadius: "0.19vh",
            flexShrink: 0,
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "2.2vh", color: "rgba(255,255,255,0.75)", fontWeight: 500, marginBottom: "0.19vh" }}>
            {settings.headerText}
          </div>
          <div style={{ fontSize: "4.2vh", fontWeight: 400, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            {displayTitle}
          </div>
        </div>
      </div>

      {/* ── Row 3: Staff stat cards ── */}
      <div style={{ display: "flex", gap: "1.4vh", position: "relative", zIndex: 1, flexShrink: 0 }}>
        {positions.length > 0
          ? positions.map((p, i) => <StaffStatCard key={i} {...p} />)
          : ["PoP", "Asst Prof", "Asso Prof", "Technical Staff"].map((p) => (
              <StaffStatCard key={p} position={p} count="—" />
            ))}
      </div>

      {/* ── Row 4: Faculty list (left) + Carousel + Stats (right column) ── */}
      <div
        style={{
          display: "flex",
          gap: "1.1vh",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          alignItems: "stretch",
        }}
      >
        <div style={{ flex: "0 0 48%", minWidth: 0, minHeight: 0 }}>
          <FacultyCard members={faculty} />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.1vh",
            overflow: "hidden",
          }}
        >
          <div style={{ width: "100%", aspectRatio: "3 / 4", flexShrink: 0 }}>
            <ImageCarousel images={carouselImages} />
          </div>

          <DepartmentHighlights
            batches={batches}
            fallback={{
              batchYear: settings.batchYear,
              studentCount: settings.studentCount,
              placements: settings.placements,
              higherStudy: settings.higherStudy,
            }}
          />
        </div>
      </div>

      {/* ── Row 5: News ticker ── */}
      <div style={{ height: "10.5vw", flexShrink: 0, position: "relative", zIndex: 1 }}>
        <NewsTickerBottom />
      </div>
    </div>
  );
}
