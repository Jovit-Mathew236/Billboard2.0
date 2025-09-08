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
import FacultySection from "@/components/display/faculty-section";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { cn } from "@/lib/utils";

export function renderBlock(block: ContentBlock) {
  const commonStyles = {
    backgroundColor: block.backgroundColor,
    color: block.textColor,
  };

  switch (block.type) {
    case "text":
      const textBlock = block as TextField;
      return (
        <div className="p-4 h-full flex flex-col" style={commonStyles}>
          <h3 className="mb-2 text-xl font-semibold">{block.title}</h3>
          <div
            className={cn(
              "overflow-auto flex-1",
              textBlock.textAlign === "center" && "text-center",
              textBlock.textAlign === "right" && "text-right"
            )}
          >
            {textBlock.content}
          </div>
        </div>
      );

    case "image":
      const imageBlock = block as ImageField;
      return (
        <div className="h-full w-full overflow-hidden rounded-3xl">
          <div className="relative w-full h-full">
            <Image
              src={imageBlock.imageUrl}
              alt={imageBlock.alt || imageBlock.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      );

    case "list":
      const listBlock = block as ListField;
      return (
        <div
          className="p-10 ml-4 h-full"
          style={{
            backgroundColor: block.backgroundColor,
            color: block.textColor,
          }}
        >
          <h3 className="mb-2 text-xl font-semibold">{block.title}</h3>
          <ul
            className={cn(
              "list-inside px-2",
              listBlock.listStyle === "number"
                ? "list-decimal text-sm"
                : listBlock.listStyle === "bullet"
                ? "list-disc"
                : "list-none"
            )}
          >
            {listBlock.items.map((item, index) => (
              <li key={index} className="mb-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "weather":
      const weatherBlock = block as WeatherField;
      return (
        <div className="p-4">
          <h3 className="mb-2 text-xl font-semibold">{block.title}</h3>
          <WeatherWidget
            location={weatherBlock.location}
            unit={weatherBlock.unit}
          />
        </div>
      );

    case "time":
      const timeBlock = block as TimeField;
      return (
        <div
          className="p-4 flex flex-col items-center justify-center h-full"
          style={commonStyles}
        >
          <h3 className="mb-2 text-xl font-semibold">{block.title}</h3>
          <div className="flex flex-col items-center">
            <TimeWidget
              format={timeBlock.format}
              showSeconds={timeBlock.showSeconds}
              className={cn(
                "font-bold flex items-center justify-center text-6xl"
              )}
            />
          </div>
        </div>
      );

    case "faculty":
      return <FacultySection />;

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

      const columnWidths = ["180px", "120px", "90px", "90px", "90px"]; // Adjust as needed

      return (
        <div className="p-4 h-full flex flex-col" style={commonStyles}>
          <h3 className="mb-4 text-2xl font-semibold">{block.title}</h3>
          <div className="overflow-auto flex-1">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="bg-black/10">
                  {tableBlock.headers.map((header, index) => (
                    <th
                      key={index}
                      className="border-2 p-3 text-left font-bold"
                      style={{ width: columnWidths[index] || "90px" }} // Use custom width
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
                    className={rowIndex % 2 === 0 ? "bg-black/5" : ""}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-2 p-3"
                        style={{ width: columnWidths[cellIndex] || "90px" }} // Match header width
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
      return <div>Unsupported block type</div>;
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
    <div className="p-6">
      <h3 className="mb-4 text-xl font-semibold">{block.title}</h3>
      <div className="space-y-2">
        {positions.map((pos, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{pos.position}:</span>
            <span>{pos.count}</span>
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
    <div className="flex items-center h-full w-full">
      {block.showNifty && niftyData && (
        <div className="flex h-full items-center bg-red-600 px-4 whitespace-nowrap">
          <span>NIFTY50</span>
          <span className="ml-2">
            {niftyData.last} {niftyData.percentChange > 0 ? "▲" : "▼"}
          </span>
        </div>
      )}

      <div
        className="flex-1 p-4 overflow-hidden"
        style={{
          transition: "opacity 1s ease-in-out",
          opacity: displayFadeState ? 1 : 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isShowingNews && newsData.length > 0 ? (
          <div className="w-full text-center">
            <h4 className="text-2xl font-medium">
              {newsData[currentDisplayIndex]?.title || "Loading news..."}
            </h4>
          </div>
        ) : weatherData ? (
          <div className="flex justify-between items-center w-full">
            <div className="text-center px-4">
              <p className="text-3xl">
                {new Date(weatherData.EpochDateTime * 1000).toLocaleString(
                  "default",
                  { weekday: "long" }
                )}
              </p>
            </div>
            <div className="text-center px-4">
              <p className="text-6xl font-bold">
                {weatherData.Temperature
                  ? fahrenheitToCelsius(weatherData.Temperature.Value).toFixed(
                      0
                    )
                  : "--"}
                °C
              </p>
              <p className="text-6xl">
                {weatherData.IconPhrase || "Weather unavailable"}
              </p>
            </div>
            <div className="text-center px-4">
              <p className="text-6xl">
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
            <p className="text-xl">Loading data...</p>
          </div>
        )}
      </div>
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
      <div className="w-full h-full flex items-center justify-center">
        Loading images...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        No images available
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg">
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
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === currentImageIndex}
          />
        </div>
      ))}

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-3 w-3 rounded-full ${
              index === currentImageIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
