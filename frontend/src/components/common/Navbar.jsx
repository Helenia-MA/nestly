import { Link, useNavigate } from 'react-router-dom';
import { useAuth} from '../../context/AuthContext';

export default function NavBar() {
    const { user, isAuthenticated, isBusinessOwner, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav style={{
            backgroundColor: 'white',
            borderBottom: '0.5px solid var(--color-border)',
            padding: '0 1.5rem',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>

        {/* logo */}
        <Link to="/" style={{
            fontSize: '20px',
            fontWeight: '500',
            color: 'var(--color-primary)',
            textDecoration: 'none'
        }}>
            Nestly
        </Link>

        {/* right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated ? (
            <>

                {/* browse as a customer */}
                <Link to="/" style={{
                    fontSize: '13px',
                    color: 'var(--color-muted',
                    textDecoration: 'none'
                }}>
                    Browse
                </Link>
                {/* dashboard link for business owners */}
                {isBusinessOwner && (
                    <Link to="/dashboard" style={{
                        fontSize: '13px',
                        color: 'var(--color-muted)',
                        textDecoration: 'none'
                    }}>
                        Dashboard
                    </Link>
                )}

                {/* admin link */}
                {isAdmin && (
                    <Link to="/admin" style={{
                        fontSize: '13px',
                        color: 'var(--color-muted)',
                        textDecoration: 'none'
                    }}>
                        Admin
                    </Link>
                )}

                {/* profile */}
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#9E4060',
                        cursor: 'pointer'
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </Link>
            </>
            ) : (
            <>
                <Link to="/login" style={{
                    fontSize: '13px',
                    color: 'var(--color-muted)',
                    textDecoration: 'none'
                }}>
                    Log in
                </Link>
                <Link to="/signup" style={{
                    fontSize: '13px',
                    color: 'white',
                    backgroundColor: 'var(--color-primary)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none'
                }}>
                    Sign up
                </Link>
            </>
            )}
        </div>
    </nav>
  )
}