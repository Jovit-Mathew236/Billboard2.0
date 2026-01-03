/* eslint-disable @next/next/no-img-element */
import {
  ContentBlock,
  TextField,
  ImageField,
  WeatherField,
  TimeField,
  StaffField,
  NewsField,
  ListField,
  TableField,
  CarouselField,
} from "@/types/blocks";
import Image from "next/image";
import WeatherWidget from "@/components/weather-widget";
import TimeWidget from "@/components/time-widget";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { cn } from "@/lib/utils";

export function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case "text":
      const textBlock = block as TextField;
      return (
        <div className="h-full flex flex-col">
          {block.title && (
            <h3 className="text-3xl font-bold mb-3 shrink-0 truncate">
              {block.title}
            </h3>
          )}
          <div
            className={cn(
              "overflow-auto flex-1 text-2xl leading-relaxed scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
              textBlock.textAlign === "center" && "text-center",
              textBlock.textAlign === "right" && "text-right",
              textBlock.textAlign === "left" && "text-left"
            )}
          >
            {textBlock.content}
          </div>
        </div>
      );

    case "image":
      const imageBlock = block as ImageField;
      return (
        <div className="h-full w-full overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={imageBlock.imageUrl}
              alt={imageBlock.alt || imageBlock.title}
              fill
              className="object-cover"
              sizes="(max-width: 4096px) 100vw"
              priority
            />
          </div>
        </div>
      );

    case "list":
      const listBlock = block as ListField;
      // Check if this is a faculty list (more than 10 items triggers flip)
      const isFacultyList = listBlock.items.length > 10;

      if (isFacultyList) {
        return <FlipableFacultyList block={listBlock} />;
      }

      return (
        <div className="h-full flex flex-col">
          {block.title && (
            <h3 className="text-3xl font-bold mb-3 shrink-0 truncate">
              {block.title}
            </h3>
          )}
          <ul
            className={cn(
              "list-inside overflow-auto flex-1 space-y-2 text-2xl scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
              listBlock.listStyle === "number"
                ? "list-decimal"
                : listBlock.listStyle === "bullet"
                ? "list-disc"
                : "list-none"
            )}
          >
            {listBlock.items.map((item, index) => (
              <li key={index} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "weather":
      const weatherBlock = block as WeatherField;
      return (
        <div className="h-full flex flex-col">
          {block.title && (
            <h3 className="text-3xl font-bold mb-3 shrink-0 truncate">
              {block.title}
            </h3>
          )}
          <div className="flex-1">
            <WeatherWidget
              location={weatherBlock.location}
              unit={weatherBlock.unit}
            />
          </div>
        </div>
      );

    case "time":
      const timeBlock = block as TimeField;
      return (
        <div className="h-full flex flex-col items-center justify-center px-2">
          {block.title && (
            <h3 className="text-4xl font-bold mb-3 shrink-0 text-center">
              {block.title}
            </h3>
          )}
          <div className="flex items-center justify-center w-full">
            <TimeWidget
              format={timeBlock.format}
              showSeconds={timeBlock.showSeconds}
              className="font-bold leading-none"
              style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}
            />
          </div>
        </div>
      );

    case "faculty":
      // Faculty is now handled as a list block with >10 items
      return (
        <div className="h-full flex items-center justify-center text-2xl text-white/50">
          Please use List Block for faculty names
        </div>
      );

    case "staff":
      return <StaffPositions block={block as StaffField} />;

    case "news":
      return <NewsTickerBlock block={block as NewsField} />;

    case "table":
      const tableBlock = block as TableField;
      let parsedRows: string[][] = [];
      try {
        parsedRows = JSON.parse(tableBlock.rows);
      } catch (error) {
        console.error("Error parsing table rows:", error);
      }

      return (
        <div className="h-full flex flex-col">
          {block.title && (
            <h3 className="text-3xl font-bold mb-3 shrink-0 truncate">
              {block.title}
            </h3>
          )}
          <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <table className="w-full border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-black/20">
                  {tableBlock.headers.map((header, index) => (
                    <th
                      key={index}
                      className="border border-white/10 p-3 text-left font-bold text-xl"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-black/5" : "bg-white/5"}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-white/10 p-3 text-lg"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "carousel":
      return <ImageCarouselBlock block={block as CarouselField} />;

    default:
      return (
        <div className="h-full flex items-center justify-center text-xl text-white/50">
          Unsupported block type
        </div>
      );
  }
}

// Staff Positions Component
export function StaffPositions({ block }: { block: StaffField }) {
  const [positions, setPositions] = useState<
    Array<{ position: string; count: string }>
  >([]);

  useEffect(() => {
    const positionRef = collection(db, "position");
    const q = query(positionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        position: doc.data().position,
        count: doc.data().count,
      }));
      setPositions(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {block.title && (
        <h3 className="text-3xl font-bold mb-4 shrink-0 truncate">
          {block.title}
        </h3>
      )}
      <div className="flex-1 overflow-auto space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {positions.map((pos, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center text-2xl leading-relaxed px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="font-medium">{pos.position}</span>
            <span className="font-bold text-3xl">{pos.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface NiftyData {
  last: number;
  percentChange: number;
}

interface WeatherDataItem {
  Temperature: {
    Value: number;
    Unit: string;
    UnitType: number;
  };
  EpochDateTime: number;
  IconPhrase: string;
}

// News Ticker Component
export function NewsTickerBlock({ block }: { block: NewsField }) {
  const [niftyData, setNiftyData] = useState<NiftyData | null>(null);
  const [newsData, setNewsData] = useState<
    Array<{ uuid: string; title: string }>
  >([]);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [displayFadeState, setDisplayFadeState] = useState(true);
  const [isShowingNews, setIsShowingNews] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherDataItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [niftyRes, newsRes, weatherRes] = await Promise.all([
          fetch("/api/services/nifty"),
          fetch("/api/services/news"),
          fetch("/api/services/weather"),
        ]);

        if (!niftyRes.ok || !newsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [nifty, news, weather] = await Promise.all([
          niftyRes.json(),
          newsRes.json(),
          weatherRes.ok ? weatherRes.json() : null,
        ]);

        setNiftyData(nifty);
        setNewsData(news.data);
        if (weather) setWeatherData(weather[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Fade transition effect
  useEffect(() => {
    if (newsData.length === 0) return;

    const intervalId = setInterval(() => {
      setDisplayFadeState(false);

      setTimeout(() => {
        if (block.showWeather) {
          // Only toggle between news and weather if showWeather is enabled
          setIsShowingNews((prev) => !prev);
        } else {
          // Always show news, but still cycle through different news items
          setIsShowingNews(true);
        }

        if (isShowingNews) {
          setCurrentDisplayIndex(
            (prevIndex) => (prevIndex + 1) % Math.min(newsData.length, 10)
          );
        }
        setDisplayFadeState(true);
      }, 1000); // Duration of fade-out
    }, 7500); // Change every 7.5 seconds

    return () => clearInterval(intervalId);
  }, [newsData.length, isShowingNews, block.showWeather]);

  const fahrenheitToCelsius = (fahrenheit: number): number => {
    return ((fahrenheit - 32) * 5) / 9;
  };

  return (
    <div className="flex items-stretch h-full w-full overflow-hidden">
      {block.showNifty && niftyData && (
        <div
          className="flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 px-4 sm:px-6 shrink-0 shadow-lg"
          style={{ minWidth: "clamp(120px, 15%, 200px)" }}
        >
          <div className="text-center">
            <p className="text-sm sm:text-base md:text-lg font-semibold mb-1">
              NIFTY50
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">
              {niftyData.last.toFixed(2)}
            </p>
            <p
              className={cn(
                "text-base sm:text-lg md:text-xl font-semibold",
                niftyData.percentChange > 0 ? "text-green-200" : "text-red-200"
              )}
            >
              {niftyData.percentChange > 0 ? "▲" : "▼"}{" "}
              {Math.abs(niftyData.percentChange).toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      <div
        className="flex-1 flex items-center justify-center px-3 sm:px-4 md:px-6 overflow-hidden transition-opacity duration-1000"
        style={{
          opacity: displayFadeState ? 1 : 0,
        }}
      >
        {isShowingNews && newsData.length > 0 ? (
          <div className="w-full text-center px-2">
            <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug line-clamp-2 sm:line-clamp-3">
              {newsData[currentDisplayIndex]?.title || "Loading news..."}
            </h4>
          </div>
        ) : weatherData ? (
          <div className="flex flex-col sm:flex-row justify-around items-center w-full gap-3 sm:gap-4 md:gap-6">
            <div className="text-center flex-1">
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-white/80 mb-1">
                Day
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {new Date(weatherData.EpochDateTime * 1000).toLocaleString(
                  "default",
                  { weekday: "long" }
                )}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-white/80 mb-1">
                Temperature
              </p>
              <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                {weatherData.Temperature
                  ? fahrenheitToCelsius(weatherData.Temperature.Value).toFixed(
                      0
                    )
                  : "--"}
                °C
              </p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mt-1 sm:mt-2 font-medium">
                {weatherData.IconPhrase || "Weather unavailable"}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-white/80 mb-1">
                Date
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {new Date(weatherData.EpochDateTime * 1000).toLocaleString(
                  "default",
                  { month: "short" }
                )}{" "}
                {new Date(weatherData.EpochDateTime * 1000).toLocaleString(
                  "default",
                  { day: "2-digit" }
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full text-center">
            <p className="text-lg sm:text-xl md:text-2xl text-white/50">
              Loading data...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Flipable Faculty List Component (for lists with >10 items)
export function FlipableFacultyList({ block }: { block: ListField }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const items = block.items || [];
  const FLIP_INTERVAL = 10000; // 10 seconds

  // Calculate items per page (half of total for >10 items)
  const itemsPerPage = Math.ceil(items.length / 2);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Auto-flip pages
  useEffect(() => {
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        setIsFlipping(false);
      }, 600);
    }, FLIP_INTERVAL);

    return () => clearInterval(interval);
  }, [totalPages]);

  // Get current page items
  const startIndex = currentPage * itemsPerPage;
  const currentPageItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-4xl font-bold truncate bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          {block.title}
        </h3>
        {totalPages > 1 && (
          <div className="flex gap-2.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 shadow-lg",
                  idx === currentPage
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 w-12"
                    : "bg-white/30 w-2.5"
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden" style={{ perspective: "2000px" }}>
        <div
          className="h-full flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent transition-all duration-600 ease-in-out"
          style={{
            transform: isFlipping ? "rotateY(90deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            opacity: isFlipping ? 0 : 1,
          }}
        >
          {currentPageItems.map((item, idx) => {
            // Parse faculty name and designation
            const parts = item.split(/,(?=[^,]+$)/); // Split on last comma
            const name = parts[0]?.trim() || item;
            const designation = parts[1]?.trim() || "";

            return (
              <div
                key={idx}
                className={cn(
                  "group relative rounded-2xl overflow-hidden",
                  "bg-gradient-to-br from-white/20 via-white/10 to-white/5",
                  "backdrop-blur-md border-2 border-white/30",
                  "hover:from-white/25 hover:via-white/15 hover:border-white/40",
                  "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
                  "flex flex-col justify-center p-6"
                )}
                style={{
                  animationDelay: `${idx * 80}ms`,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

                {/* Serial Number */}
                {/* <div className="absolute top-3 right-4 text-black/60 text-xl font-bold">
                  {String(startIndex + idx + 1).padStart(2, '0')}
                </div> */}

                {/* Content */}
                <div className="relative z-10">
                  <h4 className="text-5xl font-bold mb-2 leading-tight text-black">
                    {name}
                  </h4>
                  {designation && (
                    <p className="text-3xl font-semibold text-black leading-snug">
                      {designation}
                    </p>
                  )}
                </div>

                {/* Hover effect glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="text-center mt-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-xl font-bold text-white">
              {currentPage + 1}
            </span>
            <span className="text-white/60">/</span>
            <span className="text-lg text-white/80">{totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Image Carousel Component
export function ImageCarouselBlock({ block }: { block: CarouselField }) {
  const [images, setImages] = useState<Array<{ id: string; imageUrl: string }>>(
    []
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch images from Firebase
  useEffect(() => {
    const imagesRef = collection(db, "images");
    const q = query(imagesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imageData = snapshot.docs.map((doc) => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
      }));
      setImages(imageData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Rotate through images
  useEffect(() => {
    if (images.length === 0) return;

    const interval = block.transitionInterval || 5000; // Default to 5 seconds
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [images.length, block.transitionInterval]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-2xl text-white/50">
        Loading images...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-2xl text-white/50">
        No images available
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="absolute inset-0 w-full h-full transition-opacity duration-1000"
          style={{
            opacity: index === currentImageIndex ? 1 : 0,
            zIndex: index === currentImageIndex ? 1 : 0,
          }}
        >
          <Image
            src={image.imageUrl}
            alt={`Slide ${index + 1} background`}
            fill
            className="object-cover blur-xl scale-110"
            priority={index === currentImageIndex}
            sizes="(max-width: 4096px) 100vw"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <img
              src={image.imageUrl}
              alt={`Slide ${index + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      ))}

      {/* Pagination dots */}
      <div className="absolute w-full z-10 h-full flex items-end justify-center gap-3">
        {images.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 w-4 rounded-full transition-all duration-300 shadow-lg",
              index === currentImageIndex
                ? "bg-white scale-125"
                : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
