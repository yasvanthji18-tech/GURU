import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
  };

  return (
    <div className="glass-panel glass-panel-hover p-5 rounded-2xl border flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-white mt-1 font-outfit">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl bg-gradient-to-br border ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
