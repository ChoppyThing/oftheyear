'use client';
import { useState } from 'react';

export default function StatsToggle({ dict }: { dict: any }) {
  const [show, setShow] = useState(false);
  const stats = { users: 1240, games: 512, publishers: 86, developers: 203 };

  return (
    <div>
      <button
        onClick={() => setShow((s) => !s)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
      >
        {show ? dict.stats.hide : dict.stats.show}
      </button>

      {show && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-800/60 p-4 rounded text-center">
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="text-sm text-gray-300">{dict.stats.users}</div>
          </div>

          <div className="bg-gray-800/60 p-4 rounded text-center">
            <div className="text-2xl font-bold">{stats.games}</div>
            <div className="text-sm text-gray-300">{dict.stats.games}</div>
          </div>

          <div className="bg-gray-800/60 p-4 rounded text-center">
            <div className="text-2xl font-bold">{stats.publishers}</div>
            <div className="text-sm text-gray-300">{dict.stats.publishers}</div>
          </div>

          <div className="bg-gray-800/60 p-4 rounded text-center">
            <div className="text-2xl font-bold">{stats.developers}</div>
            <div className="text-sm text-gray-300">{dict.stats.developers}</div>
          </div>
        </div>
      )}
    </div>
  );
}
