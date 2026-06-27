import { useState} from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate} from 'react-router-dom'

export default function LoginPage() {
    const { login} = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const user = await login(formData.identifier, formData.password)

            // redirecting based on user role
            if (user.is_admin) {
                navigate('/admin')
            } else if (user.is_business_owner) {
                navigate('/dashboard')
            } else {
                navigate('/')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{backgorundColor: 'var(--color-bg)'}}>
            <div className="w-full max-w-sm">

                {/* logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold" style={{color: 'var(--color-primary)'}}>
                        Nestly
                    </h1>
                    <p className="text-sm mt-1" style={{color: 'var(--color-muted)'}}>
                        Book services near you
                    </p>
                </div>

                {/* card */}
                <div className="bg-white rounded-2x1 p-6 shadow-sm border" style={{borderColor: 'var(--color-border)'}}>
                    <h2 className="text-lg font-medium mb-5" style={{color: 'var(--color-text)'}}>
                        Log in to your account
                    </h2>

                    {/* error message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEFOF4', color: '#9E4060'}}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* email or phone */}
                        <div className="mb-4">
                            <label className="block text-xs mb-1" style={{color: 'var(--color-muted)'}}>
                                Email or Phone number
                            </label>
                            <input
                                type="text"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                placeholder="e.g. email@example.com"
                                required
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                                style={{backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)'}}
                            />
                        </div>

                        {/* password */}
                        <div className="mb-5">
                            <label className="block text-xs mb-1" style={{ color: 'var(--color-muted)' }}>
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
                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                                    style={{backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)'}}

                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                                    style={{ color: 'var(--color-muted)' }}>
                                        {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity"
                            style={{backgroundColor: 'var(--color-primary)'}}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    {/* links */}
                    <div className="mt-4 text-center">
                        <p className="text-sm" style={{color: 'var(--color-muted)'}}>
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium" style={{color: 'var(--color-primary)'}}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </ div>

            </div>
        </div>
    )
}