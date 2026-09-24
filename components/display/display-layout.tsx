"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import localFont from "next/font/local";
import { Clock3, GraduationCap, Sun } from "lucide-react";
import {
  useBatches,
  useCarouselImages,
  useDisplaySettings,
  useFaculty,
  useLabs,
  useStaffPositions,
} from "@/hooks/use-display-data";
import { BatchEntry } from "@/lib/utils/batches";
import { CarouselImage, FacultyMember, Lab } from "@/types/display";
import { EditHotspot, EditModeProvider, useEditModeState } from "./edit-hotspot";

const geistSans = localFont({
  src: "../../app/fonts/GeistVF.woff",
  weight: "100 900",
});

interface NewsItem {
  uuid: string;
  title: string;
}

interface WeatherData {
  Temperature?: { Value: number };
  IconPhrase?: string;
  EpochDateTime?: number;
}

// ─────────────────── Gradient ───────────────────
const WEATHER_REFRESH_MS = 15 * 60 * 1000;
const NIGHTLY_RELOAD_HOUR = 3;

function useNightlyReload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const next = new Date();
    next.setHours(NIGHTLY_RELOAD_HOUR, 0, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    const id = setTimeout(() => window.location.reload(), next.getTime() - Date.now());
    return () => clearTimeout(id);
  }, [enabled]);
}

const radius = (vh: number) => `calc(${vh}vh * var(--display-radius-scale, 1))`;

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
    const load = () =>
      fetch("/api/services/weather")
        .then((r) => r.json())
        .then((d) => d?.[0] && setWeather(d[0]))
        .catch(() => {});
    load();
    const id = setInterval(load, WEATHER_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const tempC = weather?.Temperature?.Value
    ? (((weather.Temperature.Value - 32) * 5) / 9).toFixed(0)
    : null;
  const condition = weather?.IconPhrase ?? "Clear";

  return (
    <div
      className="rounded-full"
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
function StaffStatCard({ position, count }: { position: string; count: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.13)",
        backdropFilter: "blur(10px)",
        borderRadius: radius(2.2),
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
        borderRadius: radius(0.85),
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

// ─────────────────── CrossFade ───────────────────
// Stacks every slide in one grid cell so the container keeps the tallest
// slide's size. The active slide fades in while the previous one fades out
// at the same time — a true dissolve that never shows an empty frame.
function CrossFade({
  index,
  slides,
  duration = 1000,
  style,
}: {
  index: number;
  slides: ReactNode[];
  duration?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "grid", ...style }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          style={{
            gridArea: "1 / 1 / 2 / 2",
            opacity: i === index ? 1 : 0,
            transition: `opacity ${duration}ms ease-in-out`,
            pointerEvents: i === index ? "auto" : "none",
          }}
        >
          {slide}
        </div>
      ))}
    </div>
  );
}

// ─────────────────── FacultyCard ───────────────────
const FACULTY_PER_PAGE = 9;
const LABS_PER_PAGE = 5;

type CardPage = { kind: "faculty"; members: FacultyMember[] } | { kind: "labs"; labs: Lab[] };

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

function FacultyMemberRow({ member }: { member: FacultyMember }) {
  const degrees = (member.specializedIn ?? "").split(",").filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.55vh" }}>
      <div style={{ fontSize: "2.35vh", fontWeight: 700, color: "#2d1fa3", lineHeight: 1.2 }}>{member.name}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55vh" }}>
        {degrees.map((d, i) => (
          <DegreeBadge key={i} label={d} />
        ))}
      </div>
    </div>
  );
}

function LabBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#8e84d6",
        borderRadius: radius(0.85),
        padding: "0.35vh 1.1vh",
        fontSize: "1.55vh",
        color: "#fff",
        fontWeight: 500,
        lineHeight: 1.45,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function LabRow({ lab }: { lab: Lab }) {
  const monogram = (lab.code.split(/[\s-]+/)[0] || lab.name.split(/\s+/).map((w) => w[0]).join("")).slice(0, 4).toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2vh" }}>
      <div
        style={{
          flex: "0 0 40%",
          aspectRatio: "16 / 11",
          borderRadius: radius(1.9),
          overflow: "hidden",
          background: lab.thumbnailUrl ? "#e8e8ee" : GRAD,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {lab.thumbnailUrl ? (
          <img src={lab.thumbnailUrl} alt={lab.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "#fff", fontSize: "3vh", fontWeight: 800, letterSpacing: "-0.02em" }}>{monogram}</span>
        )}
      </div>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "0.7vh" }}>
        <div style={{ fontSize: "2.9vh", fontWeight: 500, color: "#4b3bb8", lineHeight: 1.15 }}>{lab.name}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6vh" }}>
          {lab.code && <LabBadge label={lab.code} />}
          {lab.subject && <LabBadge label={lab.subject} />}
        </div>
      </div>
    </div>
  );
}

function FacultyCard({ members, labs }: { members: FacultyMember[]; labs: Lab[] }) {
  const [page, setPage] = useState(0);
  const pages: CardPage[] = [
    ...chunk(members, FACULTY_PER_PAGE).map((slice) => ({ kind: "faculty" as const, members: slice })),
    ...chunk(labs, LABS_PER_PAGE).map((slice) => ({ kind: "labs" as const, labs: slice })),
  ];
  const totalPages = Math.max(1, pages.length);
  const current = page % totalPages;

  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(() => setPage((p) => (p + 1) % totalPages), 8000);
    return () => clearInterval(id);
  }, [totalPages]);

  return (
    <>
      <div
        style={{
          background: "#fff",
          borderRadius: radius(2.75),
          padding: "2.75vh 3vh",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <CrossFade
          index={current}
          style={{ width: "100%", height: "100%" }}
          slides={pages.map((cardPage, p) =>
            cardPage.kind === "faculty" ? (
              <div key={p} style={{ display: "flex", flexDirection: "column", gap: "1.4vh", height: "100%" }}>
                {cardPage.members.map((m) => (
                  <FacultyMemberRow key={m.id} member={m} />
                ))}
              </div>
            ) : (
              <div key={p} style={{ display: "flex", flexDirection: "column", gap: "1.8vh", height: "100%" }}>
                {cardPage.labs.map((lab) => (
                  <LabRow key={lab.id} lab={lab} />
                ))}
              </div>
            )
          )}
        />
      </div>
      <EditHotspot region={pages[current]?.kind === "labs" ? "labs" : "faculty"} />
    </>
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

  const current = images.length ? idx % images.length : 0;

  if (images.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "rgba(255,255,255,0.1)",
          borderRadius: radius(1.85),
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
        borderRadius: radius(1.85),
        overflow: "hidden",
        background: "rgba(20,14,60,0.6)",
      }}
    >
      {images.map((img, i) => {
        const offset = (i - current + images.length) % images.length;
        if (offset > 1 && offset !== images.length - 1) return null;
        return (
          <div
            key={img.id}
            style={{
              position: "absolute",
              inset: 0,
              opacity: i === current ? 1 : 0,
              transition: "opacity 1s ease",
            }}
          >
            <img
              src={img.imageUrl}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scale(1.2)",
                filter: "blur(2.5vh) brightness(0.85) saturate(1.2)",
              }}
            />
            <img
              src={img.imageUrl}
              alt={`photo-${i}`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center center",
              }}
            />
          </div>
        );
      })}
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

  useEffect(() => {
    if (entries.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % entries.length), 8000);
    return () => clearInterval(id);
  }, [entries.length]);

  const safeIdx = idx % entries.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.9vh",
        flexShrink: 0,
        padding: "1vh",
        borderRadius: radius(2.6),
        background: "rgba(38,30,92,0.55)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(10px)",
      }}
    >
      <CrossFade
        index={safeIdx}
        slides={entries.map((current, e) => (
          <div key={e} style={{ display: "flex", flexDirection: "column", gap: "0.9vh" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9vh" }}>
              <HighlightTile label="Batch" value={current.batchYear} />
              <HighlightTile label="No of Students" value={current.studentCount} />
            </div>
            <HighlightRow label="Placements" value={current.placements} />
            <HighlightRow label="Higher Study" value={current.higherStudy} />
          </div>
        ))}
      />

      {entries.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.6vh" }}>
          {entries.map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: i === safeIdx ? "1.8vh" : "0.7vh",
                height: "0.7vh",
                borderRadius: "999px",
                background: i === safeIdx ? "#fff" : "rgba(255,255,255,0.35)",
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HighlightTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(16,12,40,0.88)",
        borderRadius: radius(1.9),
        padding: "1.2vh 1.7vh",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: "1.3vh", color: "rgba(255,255,255,0.5)", marginBottom: "0.3vh", letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ fontSize: "3vh", fontWeight: 600, color: "#fff", lineHeight: 1.15 }}>{value}</div>
    </div>
  );
}

function HighlightRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: radius(1.9),
        padding: "1.2vh 2vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.6vh",
      }}
    >
      <span style={{ fontSize: "2.5vh", fontWeight: 500, color: "#111", letterSpacing: "-0.01em" }}>{label}</span>
      <span style={{ width: "0.2vh", alignSelf: "stretch", background: "#111", margin: "-0.4vh 0" }} />
      <span style={{ fontSize: "3.2vh", fontWeight: 800, color: "#111", minWidth: "3vh" }}>{value || "-"}</span>
    </div>
  );
}

// ─────────────────── NewsTicker ───────────────────
function NewsTickerBottom() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const load = () =>
      fetch("/api/services/news")
        .then((r) => r.json())
        .then((d) => d?.data?.length && setNews(d.data))
        .catch(() => {});
    load();
    const id = setInterval(load, 300000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % Math.min(news.length, 10)),
      7000
    );
    return () => clearInterval(id);
  }, [news.length]);

  const headlines =
    news.length > 0
      ? news.slice(0, 10).map((n) => n.title)
      : ["Loading latest news…"];
  const safeIdx = idx % headlines.length;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(18,14,48,0.85)",
        backdropFilter: "blur(14px)",
        borderRadius: radius(2.2),
        padding: "0 3.9vh",
        border: "1px solid rgba(255,255,255,0.1)",
        boxSizing: "border-box",
      }}
    >
      <CrossFade
        index={safeIdx}
        duration={800}
        style={{ width: "100%", height: "100%" }}
        slides={headlines.map((headline, h) => (
          <div
            key={h}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "2.2vh",
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.55,
            }}
          >
            {headline}
          </div>
        ))}
      />
    </div>
  );
}

// ─────────────────── Main Layout ───────────────────
export default function DisplayLayout() {
  const { data: settings } = useDisplaySettings();
  const { data: positions } = useStaffPositions();
  const { data: faculty } = useFaculty();
  const { data: labs } = useLabs();
  const { data: carouselImages } = useCarouselImages();
  const { entries: batches } = useBatches();
  const editMode = useEditModeState();
  useNightlyReload(!editMode.enabled);

  const displayTitle =
    settings.title?.trim().toUpperCase() === "ELECTRONICS AND COMPUTER ENGINEERING"
      ? "Electronics & Computer Engineering"
      : settings.title;

  return (
    <EditModeProvider value={editMode}>
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
        <EditHotspot region="weather" />
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
            borderRadius: radius(0.19),
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
        <EditHotspot region="branding" />
      </div>

      {/* ── Row 3: Staff stat cards ── */}
      <div style={{ display: "flex", gap: "1.4vh", position: "relative", zIndex: 1, flexShrink: 0 }}>
        {positions.length > 0
          ? positions.map((p) => <StaffStatCard key={p.id} position={p.position} count={p.count} />)
          : ["PoP", "Asst Prof", "Asso Prof", "Technical Staff"].map((p) => (
              <StaffStatCard key={p} position={p} count="—" />
            ))}
        <EditHotspot region="staff" />
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
        <div style={{ flex: "0 0 48%", minWidth: 0, minHeight: 0, position: "relative" }}>
          <FacultyCard members={faculty} labs={labs} />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.1vh",
            overflow: editMode.enabled ? "visible" : "hidden",
          }}
        >
          <div style={{ width: "100%", aspectRatio: "3 / 4", flexShrink: 0, position: "relative" }}>
            <ImageCarousel images={carouselImages} />
            <EditHotspot region="gallery" />
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
          <DepartmentHighlights
            batches={batches}
            fallback={{
              batchYear: settings.batchYear,
              studentCount: settings.studentCount,
              placements: settings.placements,
              higherStudy: settings.higherStudy,
            }}
          />
          <EditHotspot region="batches" />
          </div>
        </div>
      </div>

      {/* ── Row 5: News ticker ── */}
      <div style={{ height: "10.5vw", flexShrink: 0, position: "relative", zIndex: 1 }}>
        <NewsTickerBottom />
        <EditHotspot region="news" />
      </div>
    </div>
    </EditModeProvider>
  );
}
