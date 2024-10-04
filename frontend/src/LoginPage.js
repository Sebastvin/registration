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
        return <p style={styles.loading}>Loading...</p>;
    }

    if (error) {
        return <p style={styles.error}>{error}</p>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>Login</h2>
                <LoginForm />
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    header: {
        marginBottom: '25px',
        textAlign: 'center',
        color: '#333333',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '10px',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: '20px',
    },
    loading: {
        textAlign: 'center',
        marginTop: '20px',
    },
};

export default LoginPage;