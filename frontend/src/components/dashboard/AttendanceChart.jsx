import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import useThemeStore from '@/store/themeStore'

const data = [
  { day: 'Mon', present: 95, absent: 5 },
  { day: 'Tue', present: 88, absent: 12 },
  { day: 'Wed', present: 92, absent: 8 },
  { day: 'Thu', present: 97, absent: 3 },
  { day: 'Fri', present: 85, absent: 15 },
  { day: 'Sat', present: 78, absent: 22 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-900 border border-gray-100 dark:border-surface-800 rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function AttendanceChart() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const axisColor = isDark ? '#4B5563' : '#D1D5DB'
  const tickColor = isDark ? '#9CA3AF' : '#6B7280'

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Attendance Trend</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">This week's overview</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <span className="text-gray-500 dark:text-gray-400">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-gray-500 dark:text-gray-400">Absent</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="present"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#presentGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1' }}
            />
            <Area
              type="monotone"
              dataKey="absent"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#absentGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#f87171' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
