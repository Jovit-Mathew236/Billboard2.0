import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.thenewsapi.com/v1/news/top?api_token=d5wP5LsdfHb662Krn2hufBpzWNHTXNJAJsqxPjxp&locale=in&limit=3&categories=business,sports,tech,general&exclude_domains=dnaindia.com",
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching news data:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
