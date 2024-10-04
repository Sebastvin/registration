import React, { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, user, onUpdate }) => {
    const [email, setEmail] = useState('');
    const [isOrganiser, setIsOrganiser] = useState(false);
    const [mealPreference, setMealPreference] = useState('vegetarian');
    const [mealPreferences, setMealPreferences] = useState({
        breakfast: false,
        lunch: false,
        dinner: false,
    });
    const [participationStartTime, setParticipationStartTime] = useState('');
    const [participationEndTime, setParticipationEndTime] = useState('');

    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setIsOrganiser(user.is_organiser);
            setMealPreference(user.meal_preference); // Set initial meal preference
            setMealPreferences({
                breakfast: user.meals.includes('breakfast'),
                lunch: user.meals.includes('lunch'),
                dinner: user.meals.includes('dinner'),
            });
            setParticipationStartTime(user.participation_start_time);
            setParticipationEndTime(user.participation_end_time);
        }
    }, [user]);

    const handleMealPreferenceChange = (e) => {
        setMealPreference(e.target.value);
    };

    const handleMealTimeChange = (e) => {
        const { name, checked } = e.target;
        setMealPreferences((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedUser = {
            email,
            is_organiser: isOrganiser,
            meal_preference: mealPreference,
            meals: Object.keys(mealPreferences).filter(meal => mealPreferences[meal]),
            participation_start_time: participationStartTime,
            participation_end_time: participationEndTime,
        };
        await onUpdate(user.id, updatedUser);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Edit User</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <label>Is Organiser:</label>
                    <input type="checkbox" checked={isOrganiser} onChange={(e) => setIsOrganiser(e.target.checked)} />
                    <label>Meal Preference:</label>
                    <select value={mealPreference} onChange={handleMealPreferenceChange}>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="meat">Meat</option>
                    </select>
                    <label>Meals:</label>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="breakfast"
                                checked={mealPreferences.breakfast}
                                onChange={handleMealTimeChange}
                            />
                            Breakfast
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="lunch"
                                checked={mealPreferences.lunch}
                                onChange={handleMealTimeChange}
                            />
                            Lunch
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="dinner"
                                checked={mealPreferences.dinner}
                                onChange={handleMealTimeChange}
                            />
                            Dinner
                        </label>
                    </div>
                    <label>Participation Start Time:</label>
                    <input type="datetime-local" value={participationStartTime} onChange={(e) => setParticipationStartTime(e.target.value)} />
                    <label>Participation End Time:</label>
                    <input type="datetime-local" value={participationEndTime} onChange={(e) => setParticipationEndTime(e.target.value)} />
                    <button type="submit">Update User</button>
                </form>
            </div>
        </div>
    );
};

export default Modal;