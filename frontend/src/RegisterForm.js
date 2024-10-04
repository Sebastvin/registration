import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';

function RegisterForm() {
    const navigate = useNavigate();
    const { checkAuthStatus } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mealPreference, setMealPreference] = useState('meat');
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
  
      const selectedMealTimes = Object.keys(mealTimes).filter(time => mealTimes[time]);
  
      const userData = {
          email,
          password,
          meal_preference: mealPreference,
          meal_times: selectedMealTimes,
          participation_start_time: participationStartTime,
          participation_end_time: participationEndTime,
      };
  
      try {
          const response = await fetch('http://localhost:5000/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
              credentials: 'include',
          });
  
          const responseText = await response.text();
          console.log('Full response:', responseText);
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          let data;
          try {
              data = JSON.parse(responseText);
          } catch (e) {
              console.error('Error parsing JSON:', e);
              throw new Error('The server returned an invalid response');
          }
  
          setSuccessMessage('Registration successful!');
          await checkAuthStatus();
          navigate('/profile');

            setEmail('');
            setPassword('');
            setMealPreference('meat');
            setMealTimes({
                breakfast: false,
                lunch: false,
                dinner: false,
            });
            setParticipationStartTime('');
            setParticipationEndTime('');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
                <label style={styles.label}>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>
            <div style={styles.field}>
                <label style={styles.label}>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>
            <div style={styles.field}>
                <label style={styles.label}>Meal Preference:</label>
                <select
                    value={mealPreference}
                    onChange={(e) => setMealPreference(e.target.value)}
                    style={styles.select}
                >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="meat">Meat</option>
  
                </select>
            </div>
            <div style={styles.field}>
                <label style={styles.label}>Meal Times:</label>
                <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="breakfast"
                            checked={mealTimes.breakfast}
                            onChange={handleMealTimeChange}
                            style={styles.checkbox}
                        />
                        Breakfast
                    </label>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="lunch"
                            checked={mealTimes.lunch}
                            onChange={handleMealTimeChange}
                            style={styles.checkbox}
                        />
                        Lunch
                    </label>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="dinner"
                            checked={mealTimes.dinner}
                            onChange={handleMealTimeChange}
                            style={styles.checkbox}
                        />
                        Dinner
                    </label>
                </div>
            </div>
            <div style={styles.field}>
                <label style={styles.label}>Participation Start Time:</label>
                <input
                    type="datetime-local"
                    value={participationStartTime}
                    onChange={(e) => setParticipationStartTime(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>
            <div style={styles.field}>
                <label style={styles.label}>Participation End Time:</label>
                <input
                    type="datetime-local"
                    value={participationEndTime}
                    onChange={(e) => setParticipationEndTime(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            {successMessage && <p style={styles.success}>{successMessage}</p>}
            <button type="submit" style={styles.button}>Register</button>
        </form>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    field: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        fontWeight: 'bold',
        marginBottom: '5px',
        color: '#555555',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        fontSize: '16px',
    },
    select: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        fontSize: '16px',
    },
    checkboxGroup: {
        display: 'flex',
        gap: '10px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        color: '#555555',
    },
    checkbox: {
        marginRight: '5px',
    },
    button: {
        padding: '10px',
        backgroundColor: '#61dafb',
        border: 'none',
        borderRadius: '4px',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
    },
    error: {
        color: 'red',
        marginBottom: '10px',
    },
    success: {
        color: 'green',
        marginBottom: '10px',
    },
};

export default RegisterForm;