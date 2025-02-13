import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://dataservice.accuweather.com/forecasts/v1/hourly/1hour/188802?apikey=258od518cXWa0GcSX1ShgFL6EpY3DTUt",
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
