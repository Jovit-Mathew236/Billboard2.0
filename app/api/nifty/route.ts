// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const response = await fetch("https://www.nseindia.com/api/allIndices", {
//       next: { revalidate: 60 }, // Cache for 1 minute
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//         Accept: "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch NIFTY data");
//     }

//     const data = await response.json();
//     const broadMarketIndex = data.find(
//       (item: { key: string }) => item.key === "BROAD MARKET INDICES"
//     );

//     return NextResponse.json(broadMarketIndex);
//   } catch (error) {
//     console.error("Error fetching NIFTY data:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch NIFTY" },
//       { status: 500 }
//     );
//   }
// }
