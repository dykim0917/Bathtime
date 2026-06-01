import type { RoutinePreset } from '@/src/archive/types';
import { ROUTINE_ENVIRONMENT_LABELS } from '@web/lib/labels';

export function RoutineCard({
  routine,
  showCta = false,
}: {
  routine: RoutinePreset;
  showCta?: boolean;
}) {
  return (
    <article className="routine-card">
      <div className="routine-duration">
        <strong>{routine.durationMinutes}</strong>
        <span>min</span>
      </div>
      <div>
        <p className="kicker">{ROUTINE_ENVIRONMENT_LABELS[routine.environment]} · {routine.situationTags.join(', ')}</p>
        <h3>{routine.title}</h3>
        <p>{routine.description}</p>
        <ol>
          {routine.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        {showCta ? (
          <a className="button-primary routine-card-cta" href={`/app?from=related_routine&routine=${encodeURIComponent(routine.id)}`}>
            앱에서 타이머로 이어가기
          </a>
        ) : null}
      </div>
    </article>
  );
}
