import React, { useEffect } from 'react';
import LoginForm from './LoginForm';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('access_token');
        if (token) {
            navigate('/profile');
        }
    }, [navigate]);

    return (
        <div>
            <h2>Login Page</h2>
            <LoginForm />
        </div>
    );
}

export default LoginPage;