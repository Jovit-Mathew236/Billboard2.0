import {
  ContentBlock,
  TextField,
  ImageField,
  WeatherField,
  TimeField,
  StaffField,
  NewsField,
  ListField,
} from "@/types/blocks";
import Image from "next/image";
import WeatherWidget from "@/components/weather-widget";
import TimeWidget from "@/components/time-widget";
import FacultySection from "@/components/display/faculty-section";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
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
            className="text-3xl font-bold"
          />
        </div>
      );

    case "faculty":
      return <FacultySection />;

    case "staff":
      return <StaffPositions block={block as StaffField} />;

    case "news":
      return <NewsTickerBlock block={block as NewsField} />;

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

// News Ticker Component
export function NewsTickerBlock({ block }: { block: NewsField }) {
  const [niftyData, setNiftyData] = useState<NiftyData | null>(null);
  const [newsData, setNewsData] = useState<
    Array<{ uuid: string; title: string }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [niftyRes, newsRes] = await Promise.all([
          fetch("/api/services/nifty"),
          fetch("/api/services/news"),
        ]);

        if (!niftyRes.ok || !newsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [nifty, news] = await Promise.all([
          niftyRes.json(),
          newsRes.json(),
        ]);

        setNiftyData(nifty);
        setNewsData(news.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-12 items-center bg-black text-white">
      {block.showNifty && (
        <div className="flex h-full items-center bg-red-600 px-4">
          <span>NIFTY50</span>
          {niftyData && (
            <span className="ml-2">
              {niftyData.last} {niftyData.percentChange > 0 ? "▲" : "▼"}
            </span>
          )}
        </div>
      )}
      <div className="flex-1">
        <Marquee speed={50} className="h-full">
          {newsData.map((news) => (
            <span key={news.uuid} className="mx-4">
              {news.title}
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
