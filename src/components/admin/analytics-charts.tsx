'use client';

import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { Sparkles, Target, Award, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface ChartDataItem {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  mbtiData: ChartDataItem[];
  enneagramData: ChartDataItem[];
  careersData: ChartDataItem[];
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#10b981', '#06b6d4', 
  '#3b82f6', '#a855f7', '#14b8a6', '#84cc16'
];

export function AnalyticsCharts({ mbtiData, enneagramData, careersData }: AnalyticsChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-extrabold text-white">{label || payload[0].name}</p>
          <p className="text-indigo-400 font-bold">
            Öğrenci Sayısı: <span className="text-white font-extrabold">{payload[0].value} Kişi</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: MBTI Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-indigo-950/20 to-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">KİŞİLİK PROFİLLERİ</span>
              <h3 className="text-base font-extrabold text-white">MBTI Dağılım Haritası</h3>
            </div>
          </div>

          <div className="h-[280px] w-full pt-4">
            {mbtiData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Henüz MBTI testi tamamlayan öğrenci bulunmuyor.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mbtiData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {mbtiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Enneagram Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-purple-950/20 to-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/40 text-purple-300">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">MOTİVASYON TİPLERİ</span>
              <h3 className="text-base font-extrabold text-white">Enneagram Baskın Tip Oranları</h3>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            {enneagramData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Henüz Enneagram verisi oluşmadı.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={enneagramData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {enneagramData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-gray-300 font-semibold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Top Career Goals Horizontal Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl bg-gradient-to-br from-amber-950/20 to-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/30 flex items-center justify-center border border-amber-500/40 text-amber-300">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">GELECEK VİZYONU</span>
            <h3 className="text-base font-extrabold text-white">En Çok Hedeflenen 7 Meslek Alanı</h3>
          </div>
        </div>

        <div className="h-[260px] w-full pt-4">
          {careersData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Öğrenciler henüz hedef mesleği girmedi.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={careersData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#888" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#ddd" fontSize={12} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#10b981">
                  {careersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 6) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
