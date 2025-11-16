export function formatText(text) {
  if (!text || typeof text !== "string") return text;
  text = text.trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
