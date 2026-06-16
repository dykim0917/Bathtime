import type { RoutinePreset } from '@/src/archive/types';
import { ROUTINE_ENVIRONMENT_LABELS } from '@web/lib/labels';
import { RoutineAppLink } from './RoutineAppLink';

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
        {showCta ? <RoutineAppLink routineId={routine.id} /> : null}
      </div>
    </article>
  );
}
