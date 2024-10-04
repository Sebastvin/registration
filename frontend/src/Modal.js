import React, { useState, useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, user, onUpdate, error, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mealPreference, setMealPreference] = useState('vegetarian');
    const [mealTimes, setMealTimes] = useState({
        breakfast: false,
        lunch: false,
        dinner: false,
    });
    const [participationStartTime, setParticipationStartTime] = useState('');
    const [participationEndTime, setParticipationEndTime] = useState('');
    const [isOrganiser, setIsOrganiser] = useState(false);
    const [internalError, setInternalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInternalError('');
            setError('');
        }

        if (user) {
            setEmail(user.email || '');
            setMealPreference(user.meal_preference || 'vegetarian');
            setMealTimes({
                breakfast: user.meals?.includes('breakfast') || false,
                lunch: user.meals?.includes('lunch') || false,
                dinner: user.meals?.includes('dinner') || false,
            });
            setParticipationStartTime(user.participation_start_time || '');
            setParticipationEndTime(user.participation_end_time || '');
            setIsOrganiser(user.is_organiser || false);
            setPassword('');
            setError('');
        } else {
            setEmail('');
            setPassword('');
            setMealPreference('vegetarian');
            setMealTimes({ breakfast: false, lunch: false, dinner: false });
            setParticipationStartTime('');
            setParticipationEndTime('');
            setIsOrganiser(false);
            setError('');
        }
    }, [user, isOpen, setError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInternalError('');
        setError('');

        if (!email) {
            setInternalError('Email is required');
            return;
        }
        if (!user && !password) {
            setInternalError('Password is required for new users');
            return;
        }
        if (!participationStartTime || !participationEndTime) {
            setInternalError('Participation start and end times are required');
            return;
        }

        const newUser = {
            email,
            ...( !user && { password }),
            meal_preference: mealPreference,
            meals: Object.keys(mealTimes).filter(meal => mealTimes[meal]),
            participation_start_time: participationStartTime,
            participation_end_time: participationEndTime,
            is_organiser: isOrganiser,
        };

        console.log('Submitting User:', newUser);

        try {
            await onUpdate(user ? user.id : null, newUser);

        } catch (err) {
            console.error('Error in form submission:', err);
            setInternalError('An error occurred while submitting the form. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{user ? 'Update User' : 'Add User'}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
    
                    {!user && (
                        <>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </>
                    )}
                    <label>Meal Preference:</label>
                    <select
                        value={mealPreference}
                        onChange={(e) => setMealPreference(e.target.value)}
                    >
                        <option value="vegetarian">Vegetarian</option>
                        <option value="meat">Meat</option>
                    </select>
                    <label>Meals:</label>
                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="breakfast"
                                checked={mealTimes.breakfast}
                                onChange={(e) =>
                                    setMealTimes({ ...mealTimes, breakfast: e.target.checked })
                                }
                            />
                            Breakfast
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="lunch"
                                checked={mealTimes.lunch}
                                onChange={(e) =>
                                    setMealTimes({ ...mealTimes, lunch: e.target.checked })
                                }
                            />
                            Lunch
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="dinner"
                                checked={mealTimes.dinner}
                                onChange={(e) =>
                                    setMealTimes({ ...mealTimes, dinner: e.target.checked })
                                }
                            />
                            Dinner
                        </label>
                    </div>
                    <label>Participation Start Time:</label>
                    <input
                        type="datetime-local"
                        value={participationStartTime}
                        onChange={(e) => setParticipationStartTime(e.target.value)}
                    />
                    <label>Participation End Time:</label>
                    <input
                        type="datetime-local"
                        value={participationEndTime}
                        onChange={(e) => setParticipationEndTime(e.target.value)}
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={isOrganiser}
                            onChange={(e) => setIsOrganiser(e.target.checked)}
                        />
                        Is Organiser
                    </label>
                    {(internalError || error) && (
                        <p className="error-message">{internalError || error}</p>
                    )}
                    <button type="submit">{user ? 'Update User' : 'Add User'}</button>
                </form>
            </div>
        </div>
    );
};

export default Modal;