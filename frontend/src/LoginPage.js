import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    method: 'GET',
                    credentials: 'include',
                });

                console.log('Auth status response:', response.status);

                if (response.ok) {
                    navigate('/profile');
                } else if (response.status === 401) {
                    console.log('User is not authenticated');
                    setIsLoading(false);
                } else {
                    throw new Error(`Unexpected response: ${response.status}`);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setError('Failed to check authentication status. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, [navigate]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h2>Login Page</h2>
            <LoginForm />
        </div>
    );
}

export default LoginPage;