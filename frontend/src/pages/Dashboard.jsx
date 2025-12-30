import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        setError('Failed to fetch quizzes');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const response = await fetch(`${API_URL}/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setQuizzes(quizzes.filter(q => q._id !== id));
      }
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  const copyQuizLink = (id) => {
    const link = `${window.location.origin}/quiz/${id}`;
    navigator.clipboard.writeText(link);
    alert('Quiz link copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header className="header">
        <h1>🎯 Quiz Management</h1>
        <div className="flex gap-2">
          <Link to="/admin/create" className="btn btn-primary">
            + Create Quiz
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        <h2>Your Quizzes</h2>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && quizzes.length === 0 && (
          <div className="card text-center mt-3">
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No quizzes yet. Create your first quiz!
            </p>
            <Link to="/admin/create" className="btn btn-primary">
              Create Your First Quiz
            </Link>
          </div>
        )}

        <div className="quiz-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p className="meta">
                📝 {quiz.questions?.length || 0} questions
              </p>
              <p className="meta">
                📅 {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
              <div className="actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => copyQuizLink(quiz._id)}
                >
                  📋 Copy Link
                </button>
                <Link 
                  to={`/admin/edit/${quiz._id}`}
                  className="btn btn-primary"
                >
                  ✏️ Edit
                </Link>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(quiz._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
