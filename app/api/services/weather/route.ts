import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://dataservice.accuweather.com/forecasts/v1/hourly/1hour/188802?apikey=zpka_6c7285b3f2474d8598854794a4d7330a_fcda23ec",
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
