import { Font } from "@react-pdf/renderer";
import path from "path";

const fontDir = path.join(
  process.cwd(),
  "public",
  "fonts"
);

Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: path.join(fontDir, "NotoSansJP-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: path.join(fontDir, "NotoSansJP-Bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

Font.registerHyphenationCallback((word) =>
  Array.from(word).flatMap((char) => [char, ''])
)
