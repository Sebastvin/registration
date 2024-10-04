import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/MainPage.css';

function MainPage() {
    const navigate = useNavigate();

    return (
        <div className="main-page">
            <header className="hero">
                <h1>Welcome to Event Registration</h1>
                <p>Simplify your event planning and registration process</p>
                <button onClick={() => navigate('/register')} className="cta-button">Get Started</button>
            </header>

            <section className="features">
                <h2>Why Choose Event Registration?</h2>
                <div className="feature-grid">
                    <div className="feature-item">
                        <h3>Effortless Registration</h3>
                        <p>Quick and easy sign-up process for all your event participants</p>
                    </div>
                    <div className="feature-item">
                        <h3>Meal Preference Tracking</h3>
                        <p>Easily manage dietary requirements and meal choices</p>
                    </div>
                    <div className="feature-item">
                        <h3>Time Management</h3>
                        <p>Set participation times and organize meal schedules efficiently</p>
                    </div>
                    <div className="feature-item">
                        <h3>Admin Controls</h3>
                        <p>Powerful tools for event organizers to manage registrations</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default MainPage;