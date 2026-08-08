import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/app-ui.css";

export const metadata = {
  title: "スキルシート管理",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
