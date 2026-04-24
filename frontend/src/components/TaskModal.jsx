import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'

const STATUS_OPTIONS = [
  { value: 'todo', label: '⏳ รอดำเนินการ' },
  { value: 'in_progress', label: '🔄 กำลังดำเนินการ' },
  { value: 'done', label: '✅ เสร็จแล้ว' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: '⚪ ต่ำ' },
  { value: 'medium', label: '🟡 ปานกลาง' },
  { value: 'high', label: '🔴 สูง' },
]

export default function TaskModal({ task, categories, tags, onSave, onClose }) {
  const isEdit = Boolean(task)
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date ? format(new Date(task.due_date), "yyyy-MM-dd'T'HH:mm") : '',
    category_id: task?.category_id || '',
    assignees: task?.assignees || [],
    tag_ids: task?.tags?.map((t) => t.id) || [],
  })
  const [assigneeInput, setAssigneeInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const titleRef = useRef()

  useEffect(() => { titleRef.current?.focus() }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const addAssignee = () => {
    const name = assigneeInput.trim()
    if (!name || form.assignees.includes(name)) return
    setForm((f) => ({ ...f, assignees: [...f.assignees, name] }))
    setAssigneeInput('')
  }

  const removeAssignee = (name) => setForm((f) => ({ ...f, assignees: f.assignees.filter((a) => a !== name) }))

  const toggleTag = (id) => setForm((f) => ({
    ...f,
    tag_ids: f.tag_ids.includes(id) ? f.tag_ids.filter((t) => t !== id) : [...f.tag_ids, id],
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('กรุณากรอกชื่องาน'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      }
      await onSave(payload)
    } catch (err) {
      setError(err.response?.data?.detail || 'เกิดข้อผิดพลาด')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">{isEdit ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none transition-colors">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <div className="bg-red-900/40 border border-red-800 text-red-300 rounded-lg px-3 py-2 text-sm">{error}</div>}
          <div>
            <label className="block text-xs text-slate-400 mb-1">ชื่องาน <span className="text-red-400">*</span></label>
            <input ref={titleRef} className="input" placeholder="กรอกชื่องาน" value={form.title} onChange={set('title')} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">รายละเอียด</label>
            <textarea className="input resize-none" rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">สถานะ</label>
              <select className="input" value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ความสำคัญ</label>
              <select className="input" value={form.priority} onChange={set('priority')}>
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">กำหนดส่ง</label>
            <input className="input" type="datetime-local" value={form.due_date} onChange={set('due_date')} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">หมวดหมู่</label>
            <select className="input" value={form.category_id} onChange={set('category_id')}>
              <option value="">-- ไม่มีหมวดหมู่ --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          {tags.length > 0 && (
            <div>
              <label className="block text-xs text-slate-400 mb-2">แท็ก</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = form.tag_ids.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selected ? 'ring-2 ring-offset-1 ring-offset-slate-900' : 'opacity-60 hover:opacity-90'}`}
                      style={{ backgroundColor: tag.color + '22', color: tag.color, borderColor: tag.color + '66' }}
                    >
                      #{tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-400 mb-1">แท็กผู้ที่เกี่ยวข้อง</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="ชื่อผู้ที่เกี่ยวข้อง"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAssignee() } }}
              />
              <button type="button" onClick={addAssignee} className="btn-secondary text-sm px-3">+ เพิ่ม</button>
            </div>
            {form.assignees.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.assignees.map((a) => (
                  <span key={a} className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                    👤 {a}
                    <button type="button" onClick={() => removeAssignee(a)} className="text-slate-400 hover:text-white ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
        <div className="flex gap-2 px-5 py-4 border-t border-slate-800 bg-slate-900">
          <button onClick={onClose} className="btn-secondary flex-1">ยกเลิก</button>
          <button onClick={handleSubmit} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มงาน'}
          </button>
        </div>
      </div>
    </div>
  )
}
