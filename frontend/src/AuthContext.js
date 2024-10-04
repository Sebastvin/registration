import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUserEmail(data.email);
            } else {
                setIsAuthenticated(false);
                setUserEmail(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUserEmail(null);
        }
    };

    const login = (email) => {
        setIsAuthenticated(true);
        setUserEmail(email);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserEmail(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;