import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { dashboardAPI } from '../api'
import { format, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_MAP = {
  todo: { label: 'รอดำเนินการ', color: 'text-amber-400', bg: 'bg-amber-500/20 text-amber-400' },
  in_progress: { label: 'กำลังดำเนินการ', color: 'text-blue-400', bg: 'bg-blue-500/20 text-blue-400' },
  done: { label: 'เสร็จแล้ว', color: 'text-emerald-400', bg: 'bg-emerald-500/20 text-emerald-400' },
}

const PRIORITY_MAP = {
  low: { label: 'ต่ำ', color: 'text-slate-400', bg: 'bg-slate-700 text-slate-300' },
  medium: { label: 'ปานกลาง', color: 'text-amber-400', bg: 'bg-amber-500/20 text-amber-400' },
  high: { label: 'สูง', color: 'text-red-400', bg: 'bg-red-500/20 text-red-400' },
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

function isOverdue(due_date, status) {
  if (!due_date || status === 'done') return false
  return new Date(due_date) < new Date()
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.stats().then(({ data }) => {
      setStats(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400 text-sm animate-pulse">กำลังโหลด...</div>
      </div>
    )
  }

  if (!stats) return null

  const pieData = [
    { name: 'รอดำเนินการ', value: stats.todo, color: '#f59e0b' },
    { name: 'กำลังดำเนินการ', value: stats.in_progress, color: '#3b82f6' },
    { name: 'เสร็จแล้ว', value: stats.done, color: '#10b981' },
  ].filter((d) => d.value > 0)

  const priorityData = [
    { name: 'สูง', value: stats.by_priority.high, fill: '#ef4444' },
    { name: 'ปานกลาง', value: stats.by_priority.medium, fill: '#f59e0b' },
    { name: 'ต่ำ', value: stats.by_priority.low, fill: '#64748b' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">ภาพรวมงานทั้งหมดของคุณ</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="งานทั้งหมด" value={stats.total} icon="📋" color="bg-indigo-500/20" />
        <StatCard label="รอดำเนินการ" value={stats.todo} icon="⏳" color="bg-amber-500/20" />
        <StatCard label="กำลังดำเนินการ" value={stats.in_progress} icon="🔄" color="bg-blue-500/20" />
        <StatCard label="เสร็จแล้ว" value={stats.done} icon="✅" color="bg-emerald-500/20" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="เกินกำหนด" value={stats.overdue} icon="🚨" color="bg-red-500/20" />
        <StatCard label="ครบกำหนดวันนี้" value={stats.due_today} icon="📅" color="bg-orange-500/20" />
        <div className="card col-span-2 flex items-center gap-4">
          <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-purple-500/20">
            🎯
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-sm mb-1">อัตราการทำงานสำเร็จ</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${stats.completion_rate}%` }}
                />
              </div>
              <span className="text-white font-bold text-sm w-12 text-right">
                {stats.completion_rate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">สัดส่วนสถานะงาน</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#f1f5f9' }} />
                <Legend formatter={(v) => <span style={{ color: '#cbd5e1', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">ยังไม่มีงาน</div>
          )}
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">งานตามความสำคัญ</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} barSize={36}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} itemStyle={{ color: '#f1f5f9' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="value" name="จำนวน" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.by_category.length > 0 && (
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4">งานตามหมวดหมู่</h2>
            <div className="space-y-3">
              {stats.by_category.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{cat.name}</span>
                      <span className="text-slate-400">{cat.count} งาน</span>
                    </div>
                    <div className="bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: stats.total > 0 ? `${(cat.count / stats.total) * 100}%` : '0%', backgroundColor: cat.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">งานล่าสุด</h2>
            <Link to="/tasks" className="text-indigo-400 hover:text-indigo-300 text-sm">ดูทั้งหมด →</Link>
          </div>
          {stats.recent_tasks.length > 0 ? (
            <div className="space-y-2">
              {stats.recent_tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    task.status === 'done' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${STATUS_MAP[task.status]?.color}`}>{STATUS_MAP[task.status]?.label}</span>
                      {task.due_date && (
                        <span className={`text-xs ${isOverdue(task.due_date, task.status) ? 'text-red-400' : 'text-slate-500'}`}>
                          • {format(parseISO(task.due_date), 'd MMM yyyy', { locale: th })}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${PRIORITY_MAP[task.priority]?.bg}`}>{PRIORITY_MAP[task.priority]?.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <span className="text-4xl mb-2">📝</span>
              <p className="text-sm">ยังไม่มีงาน</p>
              <Link to="/tasks" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2">เพิ่มงานแรก →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
