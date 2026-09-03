import { Document, Page, Text, View, StyleSheet, } from "@react-pdf/renderer";
import { ProjectFormData } from "@/types/project";
import "./fonts";

type Props = {
  userName: string;
  companyName: string;
  dateOfBirth: string | null;
  summary?: string | null;
  remarks?: string | null;
  projects: ProjectFormData[];
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    lineHeight: 1.4,
    fontFamily: "NotoSansJP",
    position: "relative",
  },
  header: {
    marginBottom: 8,
    paddingBottom: 2,
    borderBottom: "1 solid #000",
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerName: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginTop: 2,
    fontSize: 9,
  },
  companyName: {
    textAlign: "left",
    width: "30%",
  },
  userName: {
    textAlign: "right",
    width: "60%",
  },
  age: {
    textAlign: "right",
    paddingLeft: 10,
  },
  table: {
    width: "100%",
    borderTop: 1,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    padding: 1,
    display: "flex",
    textAlign: "center",
    backgroundColor: "#e0f2fe",
  },
  cell: {
    borderWidth: 1,
    borderLeft: 0,
    marginTop: -1,
    padding: 3,
    display: "flex",
  },
  center: {
    justifyContent: "center" ,
    textAlign: "center",
  },
  watermark: {
    top: "40%",
    left: "-9%",
    opacity: 0.2,
    transform: "rotate(-25deg)",
    fontSize: 150,
    color: "gray",
    zIndex: 1,
    textAlign: "center",
  },
  sectionBox: {
    marginTop: 6,
    marginBottom: 6,
    padding: 6,
    border: "1 solid #000",
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

export function SkillSheetPdfDoc({
  userName,
  companyName,
  dateOfBirth,
  summary,
  remarks,
  projects,
}: Props) {
  const tableHeaderLabels = [
    "#", "期間", "プロジェクト名", "役割", "インフラ / DB", "言語 / FW", "ツール",
    "要件定義", "基本設計", "詳細設計", "実装", "テスト", "運用・保守"
  ]
  const phaseNames = ["要件定義", "基本設計", "詳細設計", "実装", "テスト", "運用・保守"];
  const cellWidths = [20, 50, 110, 50, 80, 80, 55, 20, 20, 20, 20, 20, 20];
  const cellWidths2 = [20, 50, 110, 50, 80, 80, 55, 120];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ウォーターマーク */}
        <View style={styles.watermark}>
          <Text>社外秘</Text>
        </View>
        {/* ページヘッダ */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>スキルシート</Text>
          <View style={styles.headerName}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.userName}>氏名：{userName}</Text>
            {dateOfBirth && (
              <Text style={styles.age}>年齢：{getAge(dateOfBirth)}歳</Text>
            )}
          </View>
        </View>
        {/* テーブルヘッダ */}
        <View style={styles.table}>
          <View style={styles.row}>
            {[...Array(8)].map((_, i) => (
              <View
                style={[
                  styles.headerCell,
                  {
                    width: cellWidths2[i],
                    borderLeft: i === 0 ? 1 : 0,
                    borderRight: 1,
                    borderBottom: i === 7 ? "1" : "0"
                  },
                ]}
              >
                {i === 7 ? (
                  <Text>工程</Text>
                ) : (
                  <></>
                )}
              </View>
            ))}
          </View>
          <View style={styles.row}>
            {tableHeaderLabels.map((label, j) => (
              <View
                style={[
                  styles.headerCell,
                  {
                    width: cellWidths[j],
                    borderLeft: j === 0 ? 1 : 0,
                    borderRight: 1,
                    borderBottom: 1,
                    justifyContent: j > 6 ? "center" : undefined,
                  },
                ]}
              >
                <Text style={{ marginTop: j > 6 ? "0" : "15px" }}>{label}</Text>
              </View>
            ))}
          </View>

          {/* テーブルボディ */}
          {projects.map((p, i) => (
            <View style={[ styles.row, { fontSize: "0.75rem" } ]} wrap={false}>
              {/* # */}
              <View style={[ styles.cell, styles.center, { width: cellWidths[0], borderLeft: 1 } ]}>
                <Text>{i + 1}</Text>
              </View>
              {/* 期間 */}
              <View style={[ styles.cell, styles.center, { width: cellWidths[1] } ]}>
                <Text>{p.periodFrom?.replaceAll("-", "/")}</Text>
                <Text>〜</Text>
                <Text>{p.periodTo?.replaceAll("-", "/") || "現在"}</Text>
              </View>
              {/* プロジェクト名 */}
              <View style={[ styles.cell, { width: cellWidths[2] } ]}>
                <Text>{p.name}</Text>
              </View>
              {/* 役割 */}
              <View style={[ styles.cell, { width: cellWidths[3] } ]}>
                <Text>{p.projectJson.role}</Text>
              </View>
              {/* インフラ / DB */}
              <View style={[ styles.cell, { width: cellWidths[4] } ]}>
                {p.skillsJson.cloud.map((item, itemIndex) => (
                  <Text key={itemIndex}>{item}</Text>
                ))}
                {p.skillsJson.databases.map((item, itemIndex) => (
                  <Text key={itemIndex}>{item}</Text>
                ))}
              </View>
              {/* 言語 / FW */}
              <View style={[ styles.cell, { width: cellWidths[5] } ]}>
                {p.skillsJson.languages.map((item, itemIndex) => (
                  <Text key={itemIndex}>{item}</Text>
                ))}
                {p.skillsJson.frameworks.map((item, itemIndex) => (
                  <Text key={itemIndex}>{item}</Text>
                ))}
              </View>
              {/* ツール */}
              <View style={[ styles.cell, { width: cellWidths[6] } ]}>
                {p.skillsJson.tools.map((item, itemIndex) => (
                  <Text key={itemIndex}>{item}</Text>
                ))}
              </View>
              {/* 工程 */}
              {phaseNames.map(keyName => (
                <View style={[ styles.cell, styles.center, { width: cellWidths[7] } ]}>
                  {p.projectJson.phases.map((ph, phIndex) => (
                    <Text key={phIndex}>{keyName === ph ? "○" : ""}</Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
        {/* 自己PR */}
        {summary && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionLabel}>自己PR</Text>
            <Text style={styles.sectionText}>{summary}</Text>
          </View>
        )}
        {/* 備考 */}
        {remarks && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionLabel}>備考</Text>
            <Text style={styles.sectionText}>{remarks}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

function getAge(dateOfBirth: string) {
  // 今日の日付を YYYYMMDD の数値にする (例: 20240308)
  const today = new Date();
  const todayNum = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate();

  // 生年月日(yyyy-mm-dd)からハイフンを除去して数値にする (例: 19900515)
  const birthNum = parseInt(dateOfBirth.replace(/-/g, ''), 10);

  // 3. 差分を10000で割り、小数点以下を切り捨てる
  return Math.floor((todayNum - birthNum) / 10000);
}