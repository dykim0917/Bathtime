import type { RoutinePreset } from '@/src/archive/types';
import { ROUTINE_ENVIRONMENT_LABELS } from '@web/lib/labels';

export function RoutineCard({ routine }: { routine: RoutinePreset }) {
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
      </div>
    </article>
  );
}
