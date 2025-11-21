import { GameStatus } from '@/types/GameType';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

interface GameStatusBadgeProps {
  status: GameStatus;
}

export default function GameStatusBadge({ status }: GameStatusBadgeProps) {
  const config = {
    [GameStatus.Sent]: {
      label: 'En attente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: FaClock,
    },
    [GameStatus.Validated]: {
      label: 'Approuvé',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: FaCheckCircle,
    },
    [GameStatus.Moderated]: {
      label: 'Rejeté',
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: FaTimesCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="text-sm" />
      {label}
    </span>
  );
}
