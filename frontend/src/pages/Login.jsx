import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Login() {
  const { login, loginWithData } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

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

  const handleDemo = async () => {
    setError('')
    setDemoLoading(true)
    try {
      const { data } = await api.post('/demo/seed')
      loginWithData(data)
      navigate('/')
    } catch {
      setError('ไม่สามารถโหลดข้อมูล Demo ได้')
    } finally {
      setDemoLoading(false)
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
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading || demoLoading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-xs text-slate-500">หรือ</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={loading || demoLoading}
            className="w-full py-2.5 px-4 rounded-lg border border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all text-sm font-medium"
          >
            {demoLoading ? 'กำลังโหลดข้อมูล...' : '🎯 ทดลองใช้ด้วยข้อมูล Demo'}
          </button>

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
