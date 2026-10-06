export const metadata = {
  title: "Student app — Raine Music Studio",
  appleWebApp: { capable: true, title: "Raine Music", statusBarStyle: "black-translucent" },
};

export const viewport = { themeColor: "#110527", viewportFit: "cover" };

export default function PortalLayout({ children }) {
  return children;
}
