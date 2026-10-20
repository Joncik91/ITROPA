import { ChevronRight } from 'lucide-react';
import { DBService } from '../services/db/db.service';
import { getFutureExpressions } from '../utils/need-model';
import type { IndustryExpression } from '../types';
import { useNav } from './nav';
import { useCall } from './useCall';

const find = (list: IndustryExpression[], id: string): IndustryExpression | undefined => {
  for (const e of list) {
    if (e.id === id) return e;
    const hit = find(e.children ?? [], id);
    if (hit) return hit;
  }
  return undefined;
};

/** The industry's name for the path; a missing need or industry falls back to a plain word instead of failing the screen. */
const industryName = async (needName: string, industryId: string): Promise<string> => {
  const need = await DBService.findNeedByName(needName).catch(() => undefined);
  return (need && find(getFutureExpressions(need), industryId)?.name) || 'Industry';
};

interface Crumb { label: string; onClick?: () => void }

/** Home > need > ... > here. Everything before the current place is one tap away; the bar scrolls inside itself. */
export const PathBar = () => {
  const nav = useNav();
  const { need, step, industry, insights } = nav?.place ?? { step: 'field' as const };
  const [name] = useCall(() => (need && industry ? industryName(need, industry) : Promise.resolve('')), `path:${need}:${industry}`);
  if (!nav || (!need && !insights)) return null;
  const go = nav.go;
  const label = name.status === 'loading' ? '…' : name.status === 'done' && name.data ? name.data : 'Industry';

  const crumbs: Crumb[] = [{ label: 'Home', onClick: () => go({ step: 'field' }) }];
  if (insights) crumbs.push({ label: 'Insights' });
  else if (need) {
    const toIndustries = () => go({ need, step: 'industries' });
    // The need crumb is the way back to the field read; on Field and Industries it would point at the current page or its sibling, so it is plain text there.
    const toField = step === 'dig' || step === 'build' ? () => go({ need, step: 'field' }) : undefined;
    crumbs.push({ label: need, onClick: toField });
    if (step === 'field') crumbs.push({ label: 'Field' });
    else if (step === 'industries') crumbs.push({ label: 'Industries' });
    else {
      crumbs.push({ label: 'Industries', onClick: toIndustries });
      if (step === 'dig') crumbs.push({ label });
      else crumbs.push({ label, onClick: () => go({ need, step: 'dig', industry }) }, { label: 'Build' });
    }
  }

  return (
    <nav aria-label="Path" data-testid="path" className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm pb-1">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-2" aria-hidden />}
          {c.onClick
            ? <button type="button" onClick={c.onClick} className="text-accent underline-offset-2 hover:underline py-1">{c.label}</button>
            : <span aria-current={i === crumbs.length - 1 ? 'page' : undefined} className={i === crumbs.length - 1 ? 'font-semibold' : 'text-ink-2'}>{c.label}</span>}
        </span>
      ))}
    </nav>
  );
};
