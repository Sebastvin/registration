import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isOrganiser, setIsOrganiser] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user/role', {
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

        checkUserRole();
    }, [navigate]);

    useEffect(() => {
        if (isOrganiser) {
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
        } else {
            setIsLoading(false);
        }
    }, [isOrganiser, navigate]);

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }

                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const handleUpdateUser = async (userId, updatedUser) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            const updatedUserFromServer = await response.json();
            setUsers(users.map(user => (user.id === userId ? updatedUserFromServer : user)));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddUser = async (newUser) => {
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add user');
            }

            const addedUser = await response.json();

            setUsers((prevUsers) => [...prevUsers, addedUser]);
        } catch (error) {
            console.error('Error adding user:', error);
            setError(error.message);
        }
    };

    const openModal = (user = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!isOrganiser) {
        return <p style={{ color: 'red' }}>Access Restricted: You do not have permission to view this page.</p>;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h2>Admin Panel - User List</h2>
            <button onClick={() => openModal()}>Add User</button>
            <table style={{ margin: '20px', borderCollapse: 'collapse', width: '80%' }}>
                <thead>
                    <tr>
                        <th>Action</th>
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
                            <td>
                                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                <button onClick={() => openModal(user)}>Update</button>
                            </td>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.is_organiser ? 'Yes' : 'No'}</td>
                            <td>{user.meal_preference}</td>
                            <td>{user.participation_start_time}</td>
                            <td>{user.participation_end_time}</td>
                            <td>{user.meals ? user.meals.join(', ') : 'No meals selected'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                user={currentUser} 
                onUpdate={currentUser ? handleUpdateUser : handleAddUser} 
            />
        </div>
    );

}

export default AdminPage;