import { format, parseISO, isPast, isToday } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_OPTIONS = [
  { value: 'todo', label: 'รอดำเนินการ' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'done', label: 'เสร็จแล้ว' },
]

const PRIORITY_STYLE = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-slate-700 text-slate-400 border-slate-600',
}
const PRIORITY_LABEL = { high: '🔴 สูง', medium: '🟡 ปานกลาง', low: '⚪ ต่ำ' }

function DueDateBadge({ due_date, status }) {
  if (!due_date) return null
  const date = parseISO(due_date)
  const overdue = isPast(date) && !isToday(date) && status !== 'done'
  const today = isToday(date) && status !== 'done'
  return (
    <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : today ? 'text-orange-400' : 'text-slate-500'}`}>
      {overdue ? '🚨' : today ? '📅' : '🗓️'}
      {format(date, 'd MMM yyyy', { locale: th })}
    </span>
  )
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isDone = task.status === 'done'
  return (
    <div className={`bg-slate-800/60 border rounded-lg p-3 hover:border-slate-600 transition-all group ${isDone ? 'opacity-60 border-slate-800' : 'border-slate-700'}`}>
      <div className="flex items-start gap-2">
        <button
          onClick={() => onStatusChange(task, isDone ? 'todo' : 'done')}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 hover:border-emerald-500'}`}
        >
          {isDone && <span className="text-xs">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium break-words ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
          {task.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>}
        </div>
      </div>
      <div className="mt-2.5 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {task.category && (
            <span className="badge border text-xs" style={{ backgroundColor: task.category.color + '22', color: task.category.color, borderColor: task.category.color + '44' }}>
              {task.category.icon} {task.category.name}
            </span>
          )}
          <span className={`badge border text-xs ${PRIORITY_STYLE[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</span>
        </div>
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: tag.color + '22', color: tag.color }}>#{tag.name}</span>
            ))}
          </div>
        )}
        {task.assignees?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.assignees.map((a, i) => (
              <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">👤 {a}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <DueDateBadge due_date={task.due_date} status={task.status} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded px-1.5 py-0.5 cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={() => onEdit(task)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors text-xs">✏️</button>
            <button onClick={() => onDelete(task.id)} className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors text-xs">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  )
}
