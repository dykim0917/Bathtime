import { Info } from '@phosphor-icons/react/ssr';
import { getOnsenTermInfo, type OnsenTermInfoKey } from '@web/lib/onsenTermInfo';

type TermInfoProps = {
  termKey: OnsenTermInfoKey;
  align?: 'start' | 'end';
};

export function TermInfo({ termKey, align = 'start' }: TermInfoProps) {
  const info = getOnsenTermInfo(termKey);

  return (
    <span className="bt-term-info" data-align={align}>
      <button className="bt-term-info-trigger" type="button" aria-label={`${info.title} 설명 보기`} title={`${info.title} 설명`}>
        <Info size={14} weight="bold" aria-hidden="true" />
      </button>
      <span className="bt-term-info-popover" role="tooltip">
        <strong>{info.title}</strong>
        <span>{info.description}</span>
      </span>
    </span>
  );
}
