// src/pages/auth/SignupPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // validate at least email or phone provided
    if (!formData.email && !formData.phone) {
      setError('Please provide either an email or phone number')
      return
    }

    setLoading(true)

    try {
      const user = await signup(
        formData.name,
        formData.email,
        formData.phone,
        formData.password
      )

      // new users are always customers first
      navigate('/')

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">

        {/* logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium"
              style={{ color: 'var(--color-primary)' }}>
            Nestly
          </h1>
          <p className="text-sm mt-1"
             style={{ color: 'var(--color-muted)' }}>
            Book services near you
          </p>
        </div>

        {/* card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '0.5px solid var(--color-border)'
        }}>
          <h2 className="text-lg font-medium mb-5"
              style={{ color: 'var(--color-text)' }}>
            Create account
          </h2>

          {/* error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm"
                 style={{ backgroundColor: '#FEF0F4', color: '#9E4060' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* name */}
            <div className="mb-4">
              <label className="block text-xs mb-1"
                     style={{ color: 'var(--color-muted)' }}>
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="enter your full name"
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '0.5px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* email */}
            <div className="mb-4">
              <label className="block text-xs mb-1"
                     style={{ color: 'var(--color-muted)' }}>
                Email <span style={{ color: 'var(--color-muted)' }}>(optional if phone provided)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="enter your email address"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '0.5px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* phone */}
            <div className="mb-4">
              <label className="block text-xs mb-1"
                     style={{ color: 'var(--color-muted)' }}>
                Phone <span style={{ color: 'var(--color-muted)' }}>(optional if email provided)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="enter your phone number"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '0.5px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* password */}
            <div className="mb-5">
              <label className="block text-xs mb-1"
                     style={{ color: 'var(--color-muted)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="enter your password"
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '0.5px solid var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* business owner note */}
            <div className="mb-4 p-3 rounded-lg text-xs"
                 style={{
                   backgroundColor: '#F2F9F5',
                   border: '0.5px solid #C8E8D8',
                   color: '#4A9E75'
                 }}>
              Own a business? You can register it after signing up from your account settings.
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Already have an account?{' '}
              <Link to="/login"
                    className="font-medium"
                    style={{ color: 'var(--color-primary)' }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}