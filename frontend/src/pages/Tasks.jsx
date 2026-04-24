import { useState, useEffect, useCallback } from 'react'
import { tasksAPI, categoriesAPI, tagsAPI } from '../api'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import SearchFilter from '../components/SearchFilter'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category_id: '', tag_id: '' })

  const fetchMeta = useCallback(async () => {
    const [catRes, tagRes] = await Promise.all([categoriesAPI.list(), tagsAPI.list()])
    setCategories(catRes.data)
    setTags(tagRes.data)
  }, [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.category_id) params.category_id = filters.category_id
      if (filters.tag_id) params.tag_id = filters.tag_id
      const { data } = await tasksAPI.list(params)
      setTasks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchMeta() }, [fetchMeta])
  useEffect(() => { fetchTasks() }, [fetchTasks])

  const openCreate = () => { setEditTask(null); setShowModal(true) }
  const openEdit = (task) => { setEditTask(task); setShowModal(true) }

  const handleSave = async (payload) => {
    if (editTask) await tasksAPI.update(editTask.id, payload)
    else await tasksAPI.create(payload)
    setShowModal(false)
    fetchTasks()
  }

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันการลบงานนี้?')) return
    await tasksAPI.delete(id)
    fetchTasks()
  }

  const handleStatusChange = async (task, newStatus) => {
    await tasksAPI.update(task.id, { status: newStatus })
    fetchTasks()
  }

  const groups = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">งานทั้งหมด</h1>
          <p className="text-slate-400 text-sm mt-0.5">{tasks.length} รายการ</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span className="text-lg">+</span>เพิ่มงาน
        </button>
      </div>

      <SearchFilter filters={filters} setFilters={setFilters} categories={categories} tags={tags} />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-slate-400 text-sm animate-pulse">กำลังโหลด...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <span className="text-5xl mb-3">{hasFilters ? '🔍' : '📝'}</span>
          <p className="text-base">{hasFilters ? 'ไม่พบงานที่ตรงกับการค้นหา' : 'ยังไม่มีงาน'}</p>
          {!hasFilters && <button onClick={openCreate} className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm">+ เพิ่มงานแรก</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TaskColumn title="รอดำเนินการ" icon="⏳" color="text-amber-400" borderColor="border-amber-500/40" tasks={groups.todo} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          <TaskColumn title="กำลังดำเนินการ" icon="🔄" color="text-blue-400" borderColor="border-blue-500/40" tasks={groups.in_progress} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          <TaskColumn title="เสร็จแล้ว" icon="✅" color="text-emerald-400" borderColor="border-emerald-500/40" tasks={groups.done} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        </div>
      )}

      {showModal && (
        <TaskModal task={editTask} categories={categories} tags={tags} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

function TaskColumn({ title, icon, color, borderColor, tasks, onEdit, onDelete, onStatusChange }) {
  return (
    <div className={`bg-slate-900 border ${borderColor} rounded-xl`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
        <span>{icon}</span>
        <span className={`font-semibold text-sm ${color}`}>{title}</span>
        <span className="ml-auto bg-slate-800 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="p-3 space-y-3 min-h-[120px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-slate-600 text-sm">ไม่มีงาน</div>
        )}
      </div>
    </div>
  )
}
