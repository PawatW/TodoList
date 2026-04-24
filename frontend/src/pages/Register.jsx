import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (form.password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setLoading(true)
    try {
      await register({ username: form.username, email: form.email, password: form.password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'สมัครสมาชิกล้มเหลว')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-2xl font-bold text-white">TodoList</h1>
          <p className="text-slate-400 text-sm mt-1">สร้างบัญชีใหม่</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">สมัครสมาชิก</h2>
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">ชื่อผู้ใช้</label>
              <input className="input" type="text" placeholder="เช่น john_doe" value={form.username} onChange={set('username')} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">อีเมล</label>
              <input className="input" type="email" placeholder="example@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">รหัสผ่าน</label>
              <input className="input" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={form.password} onChange={set('password')} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">ยืนยันรหัสผ่าน</label>
              <input className="input" type="password" placeholder="กรอกรหัสผ่านอีกครั้ง" value={form.confirm} onChange={set('confirm')} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-4">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
