import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleMealTimeChange = (e) => {
    const { name, checked } = e.target;
    setMealTimes((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/profile');
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    };

    checkAuthStatus();
}, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const startTime = new Date(participationStartTime);
    const endTime = new Date(participationEndTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startTime < today) {
      setError('Participation Start Time must be today or in the future.');
      return;
    }

    if (endTime < startTime) {
      setError('Participation End Time cannot be before Participation Start Time.');
      return;
    }

    const mealChoices = Object.keys(mealTimes).filter((meal) => mealTimes[meal]);

    const userData = {
      email,
      password,
      meal_preference: mealPreference,
      participation_start_time: participationStartTime,
      participation_end_time: participationEndTime,
      meal_choices: mealChoices,
    };

    try {
      const response = await fetch('http://localhost:5000/register', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccessMessage(data.message);

      setEmail('');
      setPassword('');
      setMealPreference('vegetarian');
      setMealTimes({ breakfast: false, lunch: false, dinner: false });
      setParticipationStartTime('');
      setParticipationEndTime('');

      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Meal Preference:</label>
          <select
            value={mealPreference}
            onChange={(e) => setMealPreference(e.target.value)}
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="meat">Meat</option>
          </select>
        </div>
        <div>
          <h3>Select Meal Times:</h3>
          <label>
            <input
              type="checkbox"
              name="breakfast"
              checked={mealTimes.breakfast}
              onChange={handleMealTimeChange}
            />
            Breakfast
          </label>
          <label>
            <input
              type="checkbox"
              name="lunch"
              checked={mealTimes.lunch}
              onChange={handleMealTimeChange}
            />
            Lunch
          </label>
          <label>
            <input
              type="checkbox"
              name="dinner"
              checked={mealTimes.dinner}
              onChange={handleMealTimeChange}
            />
            Dinner
          </label>
        </div>
        <div>
          <label>Participation Start Time:</label>
          <input
            type="datetime-local"
            value={participationStartTime}
            onChange={(e) => setParticipationStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Participation End Time:</label>
          <input
            type="datetime-local"
            value={participationEndTime}
            onChange={(e) => setParticipationEndTime(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;