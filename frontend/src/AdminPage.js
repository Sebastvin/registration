import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './components/Modal';

function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isOrganiser, setIsOrganiser] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [modalError, setModalError] = useState('');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).format(date);
    };

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

            const updatedUsers = users.map(user => 
                user.id === userId ? { ...user, ...updatedUser } : user
            );
            setUsers(updatedUsers);
            closeModal();
        } catch (error) {
            console.error('Error updating user:', error);
            setModalError(error.message);
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
            closeModal();
        } catch (error) {
            console.error('Error adding user:', error);
            setModalError(error.message);
        }
    };

    const openModal = (user = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
        setModalError('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setModalError('');
    };

    if (isLoading) {
        return <p style={styles.loading}>Loading...</p>;
    }

    if (error) {
        return <p style={styles.error}>{error}</p>;
    }

    if (!isOrganiser) {
        return <p style={styles.accessDenied}>Access Restricted: You do not have permission to view this page.</p>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>Admin Panel - User List</h2>
                <button style={styles.addButton} onClick={() => openModal()}>Add User</button>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Action</th>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Is Organiser</th>
                            <th style={styles.th}>Meal Preference</th>
                            <th style={styles.th}>Participation Start Time</th>
                            <th style={styles.th}>Participation End Time</th>
                            <th style={styles.th}>Meals</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <button  style={{...styles.actionButton, ...styles.deleteButton}}  onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                    <button style={{...styles.actionButton, ...styles.updateButton}}  onClick={() => openModal(user)}>Update</button>
                                </td>
                                <td style={styles.td}>{user.id}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.is_organiser ? 'Yes' : 'No'}</td>
                                <td style={styles.td}>{user.meal_preference}</td>
                                <td style={styles.td}>{formatDate(user.participation_start_time)}</td>
                                <td style={styles.td}>{formatDate(user.participation_end_time)}</td>
                                <td style={styles.td}>{user.meals ? user.meals.join(', ') : 'No meals selected'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={closeModal} 
                    user={currentUser} 
                    onUpdate={currentUser ? handleUpdateUser : handleAddUser}
                    error={modalError}
                    setError={setModalError}
                />
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
        maxWidth: '1200px', 
        overflowX: 'auto',
    },
    header: {
        marginBottom: '25px',
        textAlign: 'center',
        color: '#333333',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '10px',
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#61dafb',
        border: 'none',
        borderRadius: '4px',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
        marginBottom: '20px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
        minWidth: '1000px', 
    },
    th: {
        border: '1px solid #ddd',
        padding: '12px 8px', 
        backgroundColor: '#f2f2f2',
        textAlign: 'left',
        whiteSpace: 'nowrap', 
    },
    tr: {
        borderBottom: '1px solid #ddd',
    },
    td: {
        border: '1px solid #ddd',
        padding: '12px 8px',
        textAlign: 'left',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    actionButton: {
        padding: '6px 12px',
        marginRight: '5px',
        backgroundColor: '#ff4d4f',
        border: 'none',
        borderRadius: '4px',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s ease',
    },
    deleteButton: {
        backgroundColor: '#ff4d4f',
    },
    updateButton: {
        backgroundColor: '#52c41a',
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
    accessDenied: {
        color: 'red',
        textAlign: 'center',
        marginTop: '20px',
    },
};


document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelector('button[style*="Add User"]');
    if (addButton) {
        addButton.addEventListener('mouseover', () => {
            addButton.style.backgroundColor = '#21a1f1';
        });
        addButton.addEventListener('mouseout', () => {
            addButton.style.backgroundColor = '#61dafb';
        });
    }

    const actionButtons = document.querySelectorAll('button[style*="background-color: #ff4d4f"]');
    actionButtons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#ff7875';
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#ff4d4f';
        });
    });
});

export default AdminPage;