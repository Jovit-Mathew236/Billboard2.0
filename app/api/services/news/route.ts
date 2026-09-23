import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const token = process.env.NEWS_API_KEY ?? process.env.NEXT_PUBLIC_NEWS_API_KEY;
  if (!token) return NextResponse.json({ data: [], message: "News API key is not configured." }, { status: 503 });

  try {
    const response = await fetch(
      `https://api.thenewsapi.com/v1/news/top?api_token=${token}&locale=in&limit=3&categories=business,sports,tech,general&exclude_domains=dnaindia.com`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error(`News API responded with ${response.status}`);
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Error fetching news data:", error);
    return NextResponse.json({ data: [], message: "Failed to fetch news" }, { status: 502 });
  }
}
