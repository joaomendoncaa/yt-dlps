export function parseBpVideoTitle(str: string): {
  title: string;
  category: string;
  participants: string[];
} {
  let title = "";
  let category = "";
  let participants: string[] = [];

  const participantMatch = str.match(/\(([^)]+)\)/);
  if (participantMatch) {
    participants = participantMatch[1].split(",").map((p) => p.trim());
  }

  const strippedTitle = str.replace(/\s*\([^)]+\)\s*$/, "");
  const parts = strippedTitle.split(":").map((part) => part.trim());

  if (parts.length >= 3) {
    category = parts[1];
    title = parts.slice(2).join(":");
  } else if (parts.length === 2) {
    title = parts[1];
  } else {
    title = strippedTitle;
  }

  return {
    title,
    category,
    participants,
  };
}
