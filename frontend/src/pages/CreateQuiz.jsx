import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

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
    
    setQuestions([...questions, questionToAdd]);
    
    // Reset form
    setCurrentQuestion({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
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

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, questions })
      });

      if (response.ok) {
        navigate('/admin');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create quiz');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="header">
        <h1>🎯 Create Quiz</h1>
        <Link to="/admin" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </header>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card mb-2">
            <div className="form-group">
              <label>Quiz Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Added Questions */}
          {questions.length > 0 && (
            <div className="mb-2">
              <h3>Added Questions ({questions.length})</h3>
              {questions.map((q, index) => (
                <div key={index} className="question-card">
                  <div className="question-header">
                    <span className="question-number">
                      Q{index + 1} • {q.type.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeQuestion(index)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Remove
                    </button>
                  </div>
                  <p>{q.question}</p>
                  {q.type === 'mcq' && (
                    <p className="meta mt-1">
                      Options: {q.options.join(', ')} | Answer: {q.correctAnswer}
                    </p>
                  )}
                  {q.type !== 'mcq' && (
                    <p className="meta mt-1">Answer: {q.correctAnswer}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Question */}
          <div className="card mb-2">
            <h3 className="mb-2">Add New Question</h3>

            <div className="form-group">
              <label>Question Type</label>
              <div className="flex gap-2 flex-wrap">
                {['mcq', 'truefalse', 'text'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`question-type-btn ${currentQuestion.type === type ? 'active' : ''}`}
                    onClick={() => setCurrentQuestion({
                      ...currentQuestion,
                      type,
                      options: type === 'mcq' ? ['', '', '', ''] : [],
                      correctAnswer: type === 'truefalse' ? 'true' : ''
                    })}
                  >
                    {type === 'mcq' ? '📝 MCQ' : type === 'truefalse' ? '✅ True/False' : '📄 Text'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Question</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your question"
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              />
            </div>

            {/* MCQ Options */}
            {currentQuestion.type === 'mcq' && (
              <div className="form-group">
                <label>Options</label>
                {currentQuestion.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    className="form-input"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    style={{ marginBottom: '0.5rem' }}
                  />
                ))}
              </div>
            )}

            {/* Correct Answer */}
            <div className="form-group">
              <label>Correct Answer</label>
              {currentQuestion.type === 'truefalse' ? (
                <select
                  className="form-input"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder={currentQuestion.type === 'mcq' ? 'Enter the correct option text' : 'Enter the correct answer'}
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                />
              )}
            </div>

            <button type="button" className="btn btn-secondary" onClick={addQuestion}>
              + Add Question
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Quiz...' : '🚀 Create Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateQuiz;
