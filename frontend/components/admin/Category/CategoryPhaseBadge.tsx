import { CategoryPhase } from '@/types/CategoryType';

interface Props {
  phase: CategoryPhase;
}

const phaseConfig = {
  [CategoryPhase.Nomination]: {
    label: 'Nominations',
    className: 'bg-blue-100 text-blue-800',
  },
  [CategoryPhase.Vote]: {
    label: 'Vote',
    className: 'bg-green-100 text-green-800',
  },
  [CategoryPhase.Closed]: {
    label: 'Clôturée',
    className: 'bg-gray-100 text-gray-800',
  },
};

export default function CategoryPhaseBadge({ phase }: Props) {
  const config = phaseConfig[phase];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
