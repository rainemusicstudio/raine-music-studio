import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "Raine Music Studio — Private online voice, piano & songwriting lessons",
  description:
    "Private online lessons in voice, piano, songwriting, and home recording with Erin. Studio-quality sound on Zoom, notes after every lesson, and simple monthly membership.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;700&family=Figtree:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&display=swap"
        />
        <meta name="theme-color" content="#110527" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
