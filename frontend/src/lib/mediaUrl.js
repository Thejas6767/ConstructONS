/**
 * Safely resolves media URLs to absolute backend URLs or Cloudinary CDN links.
 */
export function resolveMediaUrl(url) {
  if (!url) return "";
  const u = String(url).trim();
  
  // If it's already an absolute URL (Cloudinary, AWS, standard HTTP), return it exactly as is!
  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("data:") ||
    u.startsWith("blob:")
  ) {
    return u;
  }

  // If it's a relative path (Local Storage fallback), attach the backend domain
  const backend = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000").replace(
    /\/$/,
    ""
  );
  return u.startsWith("/") ? `${backend}${u}` : `${backend}/${u}`;
}