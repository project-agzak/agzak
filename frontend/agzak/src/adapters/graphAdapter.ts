import type { MemberGraphPoint } from "@/types/fortune";
import type { GraphUIPoint, GraphUISeries } from "@/types/fortune";

/** yyyy-MM-dd -> M/D */
const pretty = (d: string) => {
  const [m,day] = d.split("-").map(Number);
  return `${m}/${day}`;
};

/** 서버 배열을 7개 포인트 UI로 정리 */
export function toGraphUI(points: MemberGraphPoint[]): GraphUISeries {
  const safe = Array.isArray(points) ? points : [];

  const ui: GraphUIPoint[] = safe.map(p => ({
    date: p.date,
    label: pretty(p.date),
    original: Number(p.originalScore) || 0,
    total: Number(p.totalScore) || 0,
  }));

  const maxY = ui.reduce((m, p) => Math.max(m, p.original, p.total), 0);

  return { points: ui, maxY };
}
