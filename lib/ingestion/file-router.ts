import { parsePdf } from "./pdf-parser";
import { parseDocx } from "./docx-parser";

export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    return parsePdf(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return parseDocx(buffer);
  }
  if (mimeType === "text/plain") {
    return buffer.toString("utf-8").trim();
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

export function detectMimeType(filename: string, providedMime?: string): string {
  if (providedMime && providedMime !== "application/octet-stream") return providedMime;
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "doc") return "application/msword";
  if (ext === "txt") return "text/plain";
  return "application/octet-stream";
}
