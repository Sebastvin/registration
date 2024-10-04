import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/logout', {
                method: 'POST',
                credentials: 'include',
            });
            console.log('Logout response status:', response.status);
            const data = await response.json();
            console.log('Logout response data:', data);
    
            if (response.ok) {
                console.log('Logout successful, navigating to login page');
                navigate('/login');
            } else {
                const errorMessage = data.message || 'Logout failed';
                console.error('Logout failed:', errorMessage);
                setError(`Logout failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Logout error:', error);
            setError(`Logout failed: ${error.message || 'Unknown error'}`);
        }
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
        fetchUserProfile();
    }, [navigate]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>User Profile</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Meal Preference:</strong> {user.meal_preference}</p>
            <p><strong>Participation Start Time:</strong> {user.participation_start_time}</p>
            <p><strong>Participation End Time:</strong> {user.participation_end_time}</p>
            <h3>Meal Choices:</h3>
            {user.meals.map((meal, index) => (
                <p key={index}>{meal}</p>
            ))}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default UserProfile;