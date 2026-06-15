import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import useThemeStore from '@/store/themeStore'

// ─── Custom tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-900 border border-gray-100 dark:border-surface-800 rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {p.value}{p.name !== 'absent' ? '%' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Trend badge ──────────────────────────────────────────────────
function TrendBadge({ rate, prevRate }) {
  if (prevRate === null || prevRate === undefined) return null
  const diff = +(rate - prevRate).toFixed(1)
  if (diff === 0) return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <Minus className="h-3 w-3" /> No change
    </span>
  )
  return diff > 0 ? (
    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <TrendingUp className="h-3.5 w-3.5" /> +{diff}% vs prev day
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
      <TrendingDown className="h-3.5 w-3.5" /> {diff}% vs prev day
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────
export default function AttendanceChart({ weeklyData, loading }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const axisColor  = isDark ? '#374151' : '#E5E7EB'
  const tickColor  = isDark ? '#9CA3AF' : '#6B7280'

  // Fallback to sample data when API hasn't loaded yet (or no data)
  const FALLBACK = [
    { day: 'Mon', date: '', present: 91, absent: 9,  rate: 91 },
    { day: 'Tue', date: '', present: 88, absent: 12, rate: 88 },
    { day: 'Wed', date: '', present: 94, absent: 6,  rate: 94 },
    { day: 'Thu', date: '', present: 96, absent: 4,  rate: 96 },
    { day: 'Fri', date: '', present: 87, absent: 13, rate: 87 },
    { day: 'Sat', date: '', present: 80, absent: 20, rate: 80 },
    { day: 'Sun', date: '', present: 79, absent: 21, rate: 79 },
  ]

  const chartData = (weeklyData && weeklyData.length > 0) ? weeklyData : FALLBACK
  const isLive    = !!(weeklyData && weeklyData.length > 0)

  // Compute today's vs yesterday's rate for the trend badge
  const today     = chartData[chartData.length - 1]
  const yesterday = chartData[chartData.length - 2]

  // Avg attendance over the period
  const avgRate = chartData.length
    ? +(chartData.reduce((s, d) => s + (d.rate ?? d.present ?? 0), 0) / chartData.length).toFixed(1)
    : 0

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Attendance Trend
            </h3>
            {isLive
              ? <span className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </span>
              : <span className="text-xs text-gray-400 dark:text-gray-500 italic">sample data</span>}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Past 7 days</p>
        </div>

        <div className="text-right">
          {loading ? (
            <Skeleton className="h-8 w-16 ml-auto" />
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                {today?.rate ?? avgRate}%
              </p>
              <div className="mt-1">
                <TrendBadge rate={today?.rate ?? 0} prevRate={yesterday?.rate} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Present %</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Absent</span>
        </div>
        <div className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          Avg: <span className="font-semibold text-gray-700 dark:text-gray-300">{avgRate}%</span>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={axisColor} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: tickColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: tickColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#presentGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="absent"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#absentGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#f87171', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
