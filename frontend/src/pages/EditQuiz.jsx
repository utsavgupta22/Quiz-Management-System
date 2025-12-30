import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

function EditQuiz() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        // Fetch full quiz data including correct answers
        const fullResponse = await fetch(`${API_URL}/api/quizzes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (fullResponse.ok) {
          const fullData = await fullResponse.json();
          setQuestions(fullData.questions || []);
        }
      } else {
        setError('Failed to load quiz');
      }
    } catch (err) {
      setError('Unable to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (currentQuestion.type === 'mcq') {
      const filledOptions = currentQuestion.options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        setError('Please provide at least 2 options');
        return;
      }
      if (!filledOptions.includes(currentQuestion.correctAnswer)) {
        setError('Correct answer must be one of the options');
        return;
      }
    }

    if (!currentQuestion.correctAnswer.trim()) {
      setError('Please provide the correct answer');
      return;
    }

    setError('');
    
    const questionToAdd = {
      ...currentQuestion,
      options: currentQuestion.type === 'mcq' 
        ? currentQuestion.options.filter(o => o.trim())
        : []
    };

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = questionToAdd;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, questionToAdd]);
    }

    // Reset current question
    setCurrentQuestion({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
  };

  const editQuestion = (index) => {
    const question = questions[index];
    setCurrentQuestion({
      ...question,
      options: question.type === 'mcq' 
        ? [...question.options, '', '', '', ''].slice(0, 4)
        : ['', '', '', '']
    });
    setEditingIndex(index);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, questions })
      });

      if (response.ok) {
        navigate('/admin');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update quiz');
      }
    } catch (err) {
      setError('Unable to update quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>✏️ Edit Quiz</h1>
        <Link to="/admin" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginTop: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Quiz Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>

          <div className="questions-section">
            <h2>Questions ({questions.length})</h2>
            
            {questions.map((q, index) => (
              <div key={index} className="question-preview">
                <div className="question-header">
                  <h3>Question {index + 1}</h3>
                  <div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => editQuestion(index)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => deleteQuestion(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p><strong>Type:</strong> {q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</p>
                <p><strong>Question:</strong> {q.question}</p>
                {q.type === 'mcq' && (
                  <div>
                    <p><strong>Options:</strong></p>
                    <ul>
                      {q.options.map((opt, i) => (
                        <li key={i} style={{ color: opt === q.correctAnswer ? 'var(--success)' : 'inherit' }}>
                          {opt} {opt === q.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {q.type === 'short' && (
                  <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                )}
              </div>
            ))}

            <div className="add-question-form">
              <h3>{editingIndex !== null ? 'Edit Question' : 'Add New Question'}</h3>
              
              <div className="form-group">
                <label>Question Type</label>
                <select
                  className="form-input"
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="short">Short Answer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question</label>
                <textarea
                  className="form-input"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  placeholder="Enter your question"
                  rows="3"
                />
              </div>

              {currentQuestion.type === 'mcq' && (
                <div className="form-group">
                  <label>Options</label>
                  {currentQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      className="form-input"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      style={{ marginBottom: '0.5rem' }}
                    />
                  ))}
                </div>
              )}

              <div className="form-group">
                <label>Correct Answer</label>
                {currentQuestion.type === 'mcq' ? (
                  <select
                    className="form-input"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                  >
                    <option value="">Select correct answer</option>
                    {currentQuestion.options
                      .filter(opt => opt.trim())
                      .map((opt, index) => (
                        <option key={index} value={opt}>{opt}</option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                    placeholder="Enter correct answer"
                  />
                )}
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={addQuestion}
              >
                {editingIndex !== null ? 'Update Question' : '+ Add Question'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/admin" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditQuiz;
