import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
    const navigate = useNavigate();
    const [isOrganiser, setIsOrganiser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/check_role', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user role');
                }

                const data = await response.json();
                setIsOrganiser(data.is_organiser);
            } catch (error) {
                setError(error.message);
                navigate('/');
            }
        };

        fetchUserProfile();
    }, [navigate]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (isOrganiser === null) {
        return <p>Loading...</p>;
    }

    if (!isOrganiser) {
        return <p style={{ color: 'red' }}>Access Restricted</p>;
    }

    return (
        <div>
            <h2>Admin Page</h2>
            <p>Welcome to the admin panel!</p>
        </div>
    );
}

export default AdminPage;