import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className={`p-5 rounded-xl shadow-lg flex items-center justify-between ${color} text-white transition duration-300 hover:scale-[1.03] cursor-pointer`}>
    <div>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
    <Icon size={36} className="opacity-50" />
  </div>
);

export default StatCard;