import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    method: 'GET',
                    credentials: 'include',
                });
                setIsAuthenticated(response.ok);
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <div className="main-page">
            <h1>Registration System</h1>
            {isAuthenticated ? (
                <button onClick={() => navigate('/profile')}>Go to Profile</button>
            ) : (
                <>
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/register')}>Register</button>
                </>
            )}
        </div>
    );
}

export default MainPage;