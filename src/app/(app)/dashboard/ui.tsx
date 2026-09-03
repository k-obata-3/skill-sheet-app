"use client";

import "@/styles/dashboard.css";
import { Role } from "@prisma/client";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { Alert, Col, Row } from "react-bootstrap";
import { useState } from "react";
import { Category, CATEGORY_LABEL } from "@/types/project";
import { RankingResult, RankItem } from "@/lib/skill/skillSummary";
import { AppModal } from "@/components/ui/AppModal";
import { CategorySwitcher } from "@/components/ui/CategorySwitcher";

type Props = {
  role: Role;
  sheet: {
    id: string;
    _count: {
      projects: number,
    }
  } | null;
  userCount?: number;
  shareLinkCount?: number;
  myRanking: RankingResult;
  companyRanking: RankingResult;
};

export default function DashboardUI({
  role,
  sheet,
  userCount,
  shareLinkCount,
  myRanking,
  companyRanking,
}: Props) {
  const hasProject = Boolean(sheet?._count.projects);
  const [category, setCategory] = useState<Category>("languages");
  const [showLegendModal, setShowLegendModal] = useState<boolean>(false);

  return (
    <div>
      {/* スキルシート */}
      <Alert variant={hasProject ? "primary" : "warning"}>
        <div className="d-flex justify-content-between">
          <div className="align-self-center">{hasProject ? "スキルシートを出力できます" : "案件を登録してください"}</div>
          {hasProject && (
            <AppButton
              size="sm"
              as="a"
              href={`/pdf/skill-sheet/output`}
              target="_blank"
            >
              出力
            </AppButton>
          )}
        </div>

      </Alert>
      <div className="stat-tile-grid mb-3">
        <StatTile label="案件" value={sheet?._count.projects ?? 0} />
        {role !== "MEMBER" && <StatTile label="ユーザ" value={userCount ?? 0} />}
        {role !== "MEMBER" && <StatTile label="共有リンク" value={shareLinkCount ?? 0} />}
      </div>

      <AppCard className="shadow-sm mb-3" title="得意スキル" onclick={() => setShowLegendModal(true)}>
        <CategorySwitcher
          options={(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => ({ value: cat, label: CATEGORY_LABEL[cat] }))}
          value={category}
          onChange={setCategory}
        />

        <div className="skill-summary-grid mt-3">
          <div>
            {myRanking.byCategory[category].length === 0 && companyRanking.byCategory[category].length === 0 && (
              <div className="skill-summary-empty">
                まだデータがありません。案件にスキルを登録してください。
              </div>
            )}

            <Row>
              {myRanking.byCategory[category].length > 0 && (
                <Col md={6}>
                  <h6>あなたの案件ベース</h6>
                  {myRanking.byCategory[category].map((item: RankItem, i: number) => (
                    <RankRow
                      key={item.name}
                      index={i}
                      item={item}
                      showContributors={false}
                    />
                  ))}
                </Col>
              )}

              {companyRanking.byCategory[category].length > 0 && (
                <Col>
                  <h6>会社全体</h6>
                  {companyRanking.byCategory[category].map((item: RankItem, i: number) => (
                    <RankRow
                      key={item.name}
                      index={i}
                      item={item}
                      showContributors={true}
                    />
                  ))}
                </Col>
              )}
            </Row>
          </div>
        </div>
      </AppCard>

      <AppModal title="凡例" show={showLegendModal} onClose={() => setShowLegendModal(false)} fullscreen={"none"}>
        <div>
          <div className="mb-2">
            <div className="dashboard-legend-badge">累計</div>
            <div className="ms-2">案件期間（月）をカテゴリ内で均等配分して合算しています。</div>
          </div>

          <div className="mb-2">
            <div className="dashboard-legend-badge">比率</div>
            <div className="ms-2">全期間に対して、そのスキルが占める割合です。</div>
          </div>

          <div className="">
            <div className="dashboard-legend-badge">会社全体</div>
            <div className="ms-2">在籍の長さだけで上位にならないよう、比率＋利用人数で正規化しています。</div>
          </div>
        </div>
      </AppModal>
    </div>
  );
}


function StatTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{value}</div>
    </div>
  );
}

function RankRow({
  item,
  index,
  showContributors,
}: {
  item: RankItem;
  index: number;
  showContributors: boolean;
}) {
  const pct = Math.max(0, Math.min(100, item.coverage * 100));

  return (
    <div className="rank-row mb-2">
      <div className="rank-left">
        <div className="rank-no">{index + 1}</div>
        <div className="rank-main">
          <div className="rank-name">{item.name}</div>
          <div className="rank-sub">
            <span className="rank-chip">累計 {item.label}</span>
            <span className="rank-chip">比率 {item.coverageLabel}</span>
            {showContributors && typeof item.contributors === "number" ? (
              <span className="rank-chip">利用 {item.contributors}人</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rank-bar">
        <div className="rank-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}