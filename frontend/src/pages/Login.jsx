import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'เข้าสู่ระบบล้มเหลว')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-bold text-white">TodoList</h1>
          <p className="text-slate-400 text-sm mt-1">จัดการงานของคุณได้ง่ายๆ</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">เข้าสู่ระบบ</h2>
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">ชื่อผู้ใช้</label>
              <input
                className="input"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">รหัสผ่าน</label>
              <input
                className="input"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-4">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
