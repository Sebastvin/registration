import React, { useState } from 'react';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mealPreference, setMealPreference] = useState('vegetarian'); // Default value
  const [mealTimes, setMealTimes] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [participationStartTime, setParticipationStartTime] = useState('');
  const [participationEndTime, setParticipationEndTime] = useState('');
  const [error, setError] = useState('');

  const handleMealTimeChange = (e) => {
    const { name, checked } = e.target;
    setMealTimes((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const startTime = new Date(participationStartTime);
    const endTime = new Date(participationEndTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the start of the day

    if (startTime < today) {
      setError('Participation Start Time must be today or in the future.');
      return;
    }

    if (endTime < startTime) {
      setError('Participation End Time cannot be before Participation Start Time.');
      return;
    }

    // Handle registration logic here (e.g., API call)
    console.log('Registering with:', {
      email,
      password,
      mealPreference,
      mealTimes,
      participationStartTime,
      participationEndTime,
    });
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;