// Lets students add the app to their phone's home screen with the raindrop icon.
export default function manifest() {
  return {
    name: "Raine Music Studio",
    short_name: "Raine Music",
    description: "Your lessons, notes, and practice with Raine Music Studio.",
    start_url: "/portal",
    scope: "/",
    display: "standalone",
    background_color: "#110527",
    theme_color: "#110527",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
