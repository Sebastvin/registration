import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

function UserProfile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = Cookies.get('access_token');
            if (!token) {
                setError('No access token found. Please log in.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/users/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const data = await response.json();

                console.log(data);
                setUser(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserProfile();
    }, [id]);

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
 
        </div>
    );
}

export default UserProfile;