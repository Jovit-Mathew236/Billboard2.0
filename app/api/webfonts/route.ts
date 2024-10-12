import { NextResponse } from "next/server";

interface FontResponse {
  items: Array<{
    family: string;
    variants: string[];
    subsets: string[];
    version: string;
    lastModified: string;
    files: Record<string, string>;
  }>;
}

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONT_API_KEY; // Store your API key in .env.local
  const url = `https://webfonts.googleapis.com/v1/webfonts?capability=CAPABILITY_UNSPECIFIED&sort=STYLE&key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FontResponse = await response.json();
    return NextResponse.json(
      { message: "User created successfully", font: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error fetching web fonts:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
