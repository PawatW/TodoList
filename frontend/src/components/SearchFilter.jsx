import { useRef } from 'react'

const STATUS_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'todo', label: '⏳ รอดำเนินการ' },
  { value: 'in_progress', label: '🔄 กำลังดำเนินการ' },
  { value: 'done', label: '✅ เสร็จแล้ว' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'ทุกความสำคัญ' },
  { value: 'high', label: '🔴 สูง' },
  { value: 'medium', label: '🟡 ปานกลาง' },
  { value: 'low', label: '⚪ ต่ำ' },
]

export default function SearchFilter({ filters, setFilters, categories, tags }) {
  const searchRef = useRef()
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))
  const clearAll = () => setFilters({ search: '', status: '', priority: '', category_id: '', tag_id: '' })
  const hasActive = Object.values(filters).some(Boolean)

  return (
    <div className="mb-5 space-y-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input ref={searchRef} className="input pl-9 pr-8" placeholder="ค้นหางาน..." value={filters.search} onChange={set('search')} />
        {filters.search && (
          <button onClick={() => setFilters((f) => ({ ...f, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">×</button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <select className="input w-auto text-sm" value={filters.status} onChange={set('status')}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="input w-auto text-sm" value={filters.priority} onChange={set('priority')}>
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="input w-auto text-sm" value={filters.category_id} onChange={set('category_id')}>
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select className="input w-auto text-sm" value={filters.tag_id} onChange={set('tag_id')}>
          <option value="">ทุกแท็ก</option>
          {tags.map((t) => <option key={t.id} value={t.id}>#{t.name}</option>)}
        </select>
        {hasActive && (
          <button onClick={clearAll} className="btn-secondary text-sm px-3 py-2">ล้างตัวกรอง ×</button>
        )}
      </div>
    </div>
  )
}
