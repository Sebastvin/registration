import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError(error.message);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h2>Admin Panel - User List</h2>
            <table style={{ margin: '20px', borderCollapse: 'collapse', width: '80%' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Is Organiser</th>
                        <th>Meal Preference</th>
                        <th>Participation Start Time</th>
                        <th>Participation End Time</th>
                        <th>Meals</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.is_organiser ? 'Yes' : 'No'}</td>
                            <td>{user.meal_preference}</td>
                            <td>{user.participation_start_time}</td>
                            <td>{user.participation_end_time}</td>
                            <td>{user.meals.join(', ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPage;