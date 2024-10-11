import { writeFileSync } from "fs";
import { join } from "path";
import manifest from "./app/manifest";

// Generate the manifest object
const manifestObj = manifest();

// Convert to JSON
const manifestJson = JSON.stringify(manifestObj, null, 2);

// Write to public directory
writeFileSync(join(process.cwd(), "public", "manifest.json"), manifestJson);
writeFileSync(join(process.cwd(), "public", "site.webmanifest"), manifestJson);

console.log("manifest.json generated successfully");
