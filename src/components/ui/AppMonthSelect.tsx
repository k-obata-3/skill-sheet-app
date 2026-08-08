"use client";

import { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { YEARS, MONTHS, DAYS, fromYYYYMMDD } from "@/lib/date/monthOptions";
import { AppSelect } from "./AppSelect";

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
};

export function AppMonthSelect({
  label,
  value,
  onChange,
  allowEmpty,
}: Props) {
  // 初期値のみ props から取得（再同期しない）
  const initial = fromYYYYMMDD(value);
  const [year, setYear] = useState<number | "">(initial.year ?? "");
  const [month, setMonth] = useState<string>(initial.month ?? "");
  const [day, setDay] = useState<string>(initial.day ?? "");

  function emit(nextYear: number | "", nextMonth: string, nextDay: string) {
    const validDays = Boolean(DAYS(Number(nextYear), Number(nextMonth)).filter(d => d.value === nextDay).length);
    if(!nextYear && !nextMonth && !nextDay) {
      onChange("");
    } else if(!nextYear) {
      onChange("");
      setMonth("");
      setDay("");
    } else if (!nextMonth) {
      onChange(`${nextYear}`);
      setDay("");
    } else if(!validDays) {
      onChange(`${nextYear}-${nextMonth}`);
      setDay("");
    } else {
      onChange(`${nextYear}-${nextMonth}-${nextDay}`);
    }
  }

  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>

      <Row className="g-2">
        <Col xs={4}>
          <AppSelect
            value={year}
            onChange={(e) => {
              const y = e.target.value ? Number(e.target.value) : "";
              setYear(y);
              emit(y, month, day);
            }}
          >
            <option value="">年</option>
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </AppSelect>
        </Col>

        <Col xs={4}>
          <AppSelect
            value={month}
            disabled={!year}
            onChange={(e) => {
              const m = e.target.value;
              setMonth(m);
              emit(year, m, day);
            }}
          >
            <option value="">月</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </AppSelect>
        </Col>

        <Col xs={4}>
          <AppSelect
            value={day}
            disabled={!year || !month}
            onChange={(e) => {
              const d = e.target.value;
              setDay(d);
              emit(year, month, d);
            }}
          >
            <option value="">日</option>
            {DAYS(Number(year), Number(month)).map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </AppSelect>
        </Col>
      </Row>

      {allowEmpty && (
        <Form.Text className="text-muted">
          未選択の場合は「現在」として扱われます
        </Form.Text>
      )}
    </Form.Group>
  );
}
