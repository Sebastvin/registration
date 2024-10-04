import React from 'react';
import RegisterForm from './RegisterForm';

function RegisterPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Register</h2>
        <RegisterForm />
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
        maxWidth: '500px',
    },
    header: {
        marginBottom: '25px',
        textAlign: 'center',
        color: '#333333',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '10px',
    },
};

export default RegisterPage;