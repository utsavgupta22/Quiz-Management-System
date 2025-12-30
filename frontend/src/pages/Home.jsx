import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Quiz Hub</h1>
        <p>Choose a quiz and test your knowledge!</p>
        <Link to="/login" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Admin Login
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <h2>No Quizzes Available</h2>
          <p>Check back later for new quizzes!</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p className="quiz-date">
                Created: {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
              <Link to={`/quiz/${quiz._id}`} className="btn btn-primary">
                Take Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
