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
          className="p-4 h-full"
          style={{
            backgroundColor: block.backgroundColor,
            color: block.textColor,
          }}
        >
          <h3 className="mb-2 text-xl font-semibold">{block.title}</h3>
          <ul
            className={cn(
              "list-inside",
              listBlock.listStyle === "number"
                ? "list-decimal"
                : listBlock.listStyle === "bullet"
                ? "list-disc"
                : "list-none"
            )}
          >
            {listBlock.items.map((item, index) => (
              <li key={index} className="mb-2">
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
          <TimeWidget
            format={timeBlock.format}
            showSeconds={timeBlock.showSeconds}
            className="text-6xl font-bold flex flex-col items-center justify-center"
          />
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
                      <td key={cellIndex} className="border-2 p-3">
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
