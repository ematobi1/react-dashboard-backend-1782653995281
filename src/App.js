import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {decodeToken} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = decodeToken(storedToken);
      setUsername(decodedToken.username);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username: username,
        password: password
      });
      const token = response.data.token;
      setToken(token);
      localStorage.setItem('token', token);
      const decodedToken = decodeToken(token);
      setUsername(decodedToken.username);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div>
      {token ? (
        <Dashboard handleLogout={handleLogout} />
      ) : (
        <Login
          username={username}
          password={password}
          handleLogin={handleLogin}
          error={error}
          setUsername={(event) => setUsername(event.target.value)}
          setPassword={(event) => setPassword(event.target.value)}
        />
      )}
    </div>
  );
}

export default App;