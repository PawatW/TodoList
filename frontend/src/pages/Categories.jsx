import { useState, useEffect, useCallback } from 'react'
import { categoriesAPI, tagsAPI, tasksAPI } from '../api'

const PRESET_COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b']
const PRESET_ICONS = ['📁','💼','🏠','🛒','❤️','📚','🎮','🎯','⭐','🌟','🏋️','🍔','✈️','💡','🔧']

function CategoryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', color: '#6366f1', icon: '📁' })
  const handleSubmit = (e) => { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }
  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-xs text-slate-400 mb-1">ชื่อหมวดหมู่</label>
        <input className="input" placeholder="เช่น งาน, ส่วนตัว" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-2">ไอคอน</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_ICONS.map((icon) => (
            <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${form.icon === icon ? 'bg-indigo-600 ring-2 ring-indigo-400' : 'bg-slate-700 hover:bg-slate-600'}`}>{icon}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-2">สี</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button key={color} type="button" onClick={() => setForm({ ...form, color })} className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary text-sm flex-1">บันทึก</button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">ยกเลิก</button>
      </div>
    </form>
  )
}

function TagForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', color: '#6366f1' })
  const handleSubmit = (e) => { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }
  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-xs text-slate-400 mb-1">ชื่อแท็ก</label>
        <input className="input" placeholder="เช่น urgent, design" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-2">สี</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button key={color} type="button" onClick={() => setForm({ ...form, color })} className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary text-sm flex-1">เพิ่มแท็ก</button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">ยกเลิก</button>
      </div>
    </form>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [taskCounts, setTaskCounts] = useState({})
  const [showCatForm, setShowCatForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [editCat, setEditCat] = useState(null)

  const fetchAll = useCallback(async () => {
    const [catRes, tagRes, taskRes] = await Promise.all([categoriesAPI.list(), tagsAPI.list(), tasksAPI.list()])
    setCategories(catRes.data)
    setTags(tagRes.data)
    const counts = {}
    taskRes.data.forEach((task) => { if (task.category_id) counts[task.category_id] = (counts[task.category_id] || 0) + 1 })
    setTaskCounts(counts)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSaveCat = async (form) => {
    if (editCat) await categoriesAPI.update(editCat.id, form)
    else await categoriesAPI.create(form)
    setShowCatForm(false); setEditCat(null); fetchAll()
  }

  const handleDeleteCat = async (id) => {
    if (!confirm('ลบหมวดหมู่นี้? งานที่อยู่ในหมวดนี้จะไม่มีหมวดหมู่')) return
    await categoriesAPI.delete(id); fetchAll()
  }

  const handleSaveTag = async (form) => { await tagsAPI.create(form); setShowTagForm(false); fetchAll() }
  const handleDeleteTag = async (id) => { if (!confirm('ลบแท็กนี้?')) return; await tagsAPI.delete(id); fetchAll() }
  const startEditCat = (cat) => { setEditCat(cat); setShowCatForm(true) }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">หมวดหมู่ &amp; แท็ก</h1>
        <p className="text-slate-400 text-sm mt-0.5">จัดกลุ่มงานของคุณ</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">หมวดหมู่</h2>
            <button onClick={() => { setEditCat(null); setShowCatForm(!showCatForm) }} className="text-sm text-indigo-400 hover:text-indigo-300">{showCatForm ? 'ยกเลิก' : '+ เพิ่ม'}</button>
          </div>
          {showCatForm && <div className="mb-3"><CategoryForm initial={editCat} onSave={handleSaveCat} onCancel={() => { setShowCatForm(false); setEditCat(null) }} /></div>}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: cat.color + '33' }}>{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{cat.name}</p>
                  <p className="text-xs text-slate-500">{taskCounts[cat.id] || 0} งาน</p>
                </div>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex gap-1">
                  <button onClick={() => startEditCat(cat)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">✏️</button>
                  <button onClick={() => handleDeleteCat(cat.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">🗑️</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <div className="card text-center text-slate-500 text-sm py-6">ยังไม่มีหมวดหมู่</div>}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">แท็ก</h2>
            <button onClick={() => setShowTagForm(!showTagForm)} className="text-sm text-indigo-400 hover:text-indigo-300">{showTagForm ? 'ยกเลิก' : '+ เพิ่ม'}</button>
          </div>
          {showTagForm && <div className="mb-3"><TagForm onSave={handleSaveTag} onCancel={() => setShowTagForm(false)} /></div>}
          <div className="card">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}44` }}>
                    <span>#</span><span>{tag.name}</span>
                    <button onClick={() => handleDeleteTag(tag.id)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-xs">×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-sm py-4">ยังไม่มีแท็ก</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
