export function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "").replace(/\./g, " ");
}

export function removeBracketedText(text: string): string {
  return text.replace(/\[[^\]]*\]/g, "").trim();
}

export function removeResolutionText(text: string): string {
  return text.replace(/\b(720p|1080p|480p|360p)\b/gi, "").replace(/\s{2,}/g, " ").trim();
}

export function removeSourceAndCodec(text: string): string {
  // Remove WEBRip, x265, x264, and group tags like -KONTRAST, -ELiTE, etc.
  return text
    .replace(/\b(WEBRip|WEB-DL|BluRay|HDRip|BRRip|DVDRip|AMZN|NF|MAX|DSNP|Atmos|mp4|DD.5.1|DDP5.1|AAC2.0|DDP2.0|H.264|x265|x264)\b/gi, "")
    .replace(/-([A-Za-z0-9]+)$/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function formatSize(bytes: number) {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatNumber(num: number) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}