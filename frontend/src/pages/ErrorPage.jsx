import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ErrorPage = ({ code = "404", message = "PAGE NOT FOUND" }) => {
    return (
        <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
                <div style={{ maxWidth: '600px' }}>
                    <h1 style={{
                        fontSize: 'clamp(6rem, 15vw, 12rem)',
                        fontWeight: '950',
                        margin: 0,
                        lineHeight: 1,
                        background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.05) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.05em'
                    }}>
                        {code}
                    </h1>
                    <p style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: '900',
                        letterSpacing: '0.2em',
                        color: 'rgba(255,255,255,0.4)',
                        marginTop: '-10px',
                        marginBottom: '40px'
                    }}>
                        {message.toUpperCase()}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '40px', lineHeight: '1.6' }}>
                        The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                    <Link to="/" className="btn-primary" style={{ borderRadius: '2px', padding: '16px 40px' }}>
                        Return to Safety
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ErrorPage
