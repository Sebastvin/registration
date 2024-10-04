import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, userEmail, logout, isOrganizer } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                logout();
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <h2 className="navbar-title" onClick={() => navigate('/')}>Registration System</h2>
            <div className="menu-icon" onClick={toggleMenu}>
                &#9776;
            </div>
            <div className={`navbar-items ${isMenuOpen ? 'active' : ''}`}>
                {isAuthenticated && userEmail ? (
                    <>
                        <span className="user-email">{userEmail}</span>
                        <button className="navbar-button" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button className="navbar-button" onClick={() => navigate('/login')}>Login</button>
                        <button className="navbar-button" onClick={() => navigate('/register')}>Register</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;