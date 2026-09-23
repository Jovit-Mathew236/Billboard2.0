import { NextResponse } from "next/server";

export const revalidate = 600;

const LATITUDE = process.env.WEATHER_LATITUDE ?? "9.7266";
const LONGITUDE = process.env.WEATHER_LONGITUDE ?? "76.7263";

const CONDITIONS: Array<[number[], string]> = [
  [[0], "Clear"],
  [[1], "Mostly clear"],
  [[2], "Partly cloudy"],
  [[3], "Cloudy"],
  [[45, 48], "Fog"],
  [[51, 53, 55, 56, 57], "Drizzle"],
  [[61, 63, 66, 80, 81], "Rain"],
  [[65, 67, 82], "Heavy rain"],
  [[71, 73, 75, 77, 85, 86], "Snow"],
  [[95, 96, 99], "Thunderstorm"],
];

const describe = (code: number) => CONDITIONS.find(([codes]) => codes.includes(code))?.[1] ?? "Clear";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit&timezone=auto`,
      { next: { revalidate: 600 } }
    );
    if (!response.ok) throw new Error(`Weather API responded with ${response.status}`);
    const { current } = await response.json();

    return NextResponse.json([
      {
        EpochDateTime: Math.floor(new Date(current.time).getTime() / 1000),
        IconPhrase: describe(current.weather_code),
        IsDaylight: current.is_day === 1,
        Temperature: { Value: current.temperature_2m, Unit: "F", UnitType: 18 },
      },
    ]);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json([], { status: 502 });
  }
}
