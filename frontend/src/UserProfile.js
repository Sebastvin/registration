import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';

function UserProfile() {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).format(date);
      };

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                method: 'GET',
                credentials: 'include',
            });

            console.log('Profile response status:', response.status);

            if (response.status === 401) {
                console.log('Unauthorized, redirecting to login');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const data = await response.json();
            console.log('Profile data:', data);
            setUser(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (error) {
        return <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p>;
    }

    if (!user) {
        return <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>User Profile</h2>
                <div style={styles.field}>
                    <span style={styles.label}>Email:</span>
                    <span style={styles.value}>{user.email}</span>
                </div>
                <div style={styles.field}>
                    <span style={styles.label}>Meal Preference:</span>
                    <span style={styles.value}>{user.meal_preference}</span>
                </div>
                <div style={styles.field}>
                    <span style={styles.label}>Participation Start Time:</span>
                    <span style={styles.value}>{formatDate(user.participation_start_time)}</span>
                </div>
                <div style={styles.field}>
                    <span style={styles.label}>Participation End Time:</span>
                    <span style={styles.value}>{formatDate(user.participation_end_time)}</span>
                </div>
                <div style={styles.field}>
                    <span style={styles.label}>Meal Choices:</span>
                    {user.meals.map((meal, index) => (
                        <p key={index} style={styles.mealChoice}>
                            {meal}
                        </p>
                    ))}
                </div>
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
        maxWidth: '600px',
    },
    header: {
        marginBottom: '25px',
        textAlign: 'center',
        color: '#333333',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '10px',
    },
    field: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontWeight: 'bold',
        marginBottom: '5px',
        color: '#555555',
    },
    value: {
        display: 'block',
        color: '#777777',
        paddingLeft: '10px',
    },
    list: {
        listStyleType: 'disc',
        paddingLeft: '30px',
        marginTop: '5px',
        color: '#777777',
    },
    listItem: {
        marginBottom: '5px',
    },
    mealChoice: {
        marginLeft: '10px',
        color: '#777777',
        marginBottom: '5px',
    },
};

export default UserProfile;