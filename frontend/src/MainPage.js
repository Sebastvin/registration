import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function MainPage() {
    const navigate = useNavigate();
    const token = Cookies.get('access_token');

    return (
        <div className="main-page">
            <h1>Registration System</h1>
            {token ? (
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