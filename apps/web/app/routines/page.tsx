import type { Metadata } from 'next';
import { RoutineCard } from '@web/components/RoutineCard';
import { getPublishedRoutinePresets } from '@web/lib/archive';

export const metadata: Metadata = {
  title: '의식',
  description: '바스타임에서 바로 따라 해볼 수 있는 짧은 샤워, 족욕, 입욕 의식입니다.',
};

export default function RoutinesPage() {
  const routines = getPublishedRoutinePresets();

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <p className="kicker">BATH TIME RITUALS</p>
        <h1>바로 해볼 수 있는 의식</h1>
        <p>웹에서는 흐름을 미리 보고, 앱에서는 타이머와 보관함으로 이어갈 수 있습니다.</p>
      </header>
      <div className="routine-grid">
        {routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}
      </div>
    </div>
  );
}
