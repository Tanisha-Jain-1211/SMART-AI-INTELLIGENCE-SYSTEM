// Resolves complaint image URLs for Cloudinary HTTPS paths or legacy relative paths.
export function complaintImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiRoot =
    import.meta.env.VITE_API_URL?.replace(/\/?api\/?$/i, "") ||
    "http://localhost:5000";
  const normalized = String(imageUrl).replace(/\\/g, "/").replace(/^\//, "");
  return `${apiRoot}/${normalized}`;
}
