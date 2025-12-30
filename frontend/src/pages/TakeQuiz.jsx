import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

function TakeQuiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      } else {
        setError('Quiz not found');
      }
    } catch (err) {
      setError('Unable to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/quizzes/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setError('Failed to submit quiz');
      }
    } catch (err) {
      setError('Unable to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center" style={{ paddingTop: '4rem' }}>
        <div className="card">
          <h2>😕 {error}</h2>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            The quiz you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Show results
  if (results) {
    return (
      <div className="container">
        <div className="results-container">
          <div className="score-circle">
            <span className="percentage">{results.percentage}%</span>
            <span className="label">Score</span>
          </div>
          <h2>{results.quizTitle}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            You got {results.correctAnswers} out of {results.totalQuestions} questions correct!
          </p>
        </div>

        <h3 className="mb-2">Review Answers</h3>
        {results.results.map((result, index) => (
          <div key={result.questionId} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              <span style={{ 
                color: result.isCorrect ? 'var(--success)' : 'var(--error)',
                fontWeight: 600
              }}>
                {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
            <p style={{ marginBottom: '1rem' }}>{result.question}</p>
            <p style={{ color: 'var(--text-muted)' }}>
              Your answer: <strong>{result.userAnswer}</strong>
            </p>
            {!result.isCorrect && (
              <p style={{ color: 'var(--success)' }}>
                Correct answer: <strong>{result.correctAnswer}</strong>
              </p>
            )}
          </div>
        ))}

        <div className="text-center mt-3">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  // Show quiz
  return (
    <div>
      <header className="header">
        <h1>🎯 {quiz.title}</h1>
        <span style={{ color: 'var(--text-muted)' }}>
          {quiz.questions.length} Questions
        </span>
      </header>

      <div className="container">
        {quiz.questions.map((question, index) => (
          <div key={question._id} className="question-card">
            <div className="question-header">
              <span className="question-number">
                Q{index + 1} • {question.type.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{question.question}</p>

            {/* MCQ Options */}
            {question.type === 'mcq' && (
              <div className="options-list">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`option-item ${answers[question._id] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerChange(question._id, option)}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '2px solid var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--primary)'
                    }}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    {option}
                  </div>
                ))}
              </div>
            )}

            {/* True/False */}
            {question.type === 'truefalse' && (
              <div className="options-list">
                {['true', 'false'].map((option) => (
                  <div
                    key={option}
                    className={`option-item ${answers[question._id] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerChange(question._id, option)}
                  >
                    <span style={{
                      fontSize: '1.25rem',
                      marginRight: '0.5rem'
                    }}>
                      {option === 'true' ? '✓' : '✗'}
                    </span>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </div>
                ))}
              </div>
            )}

            {/* Text Input */}
            {question.type === 'text' && (
              <input
                type="text"
                className="form-input"
                placeholder="Type your answer here..."
                value={answers[question._id] || ''}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : '📤 Submit Quiz'}
        </button>
      </div>
    </div>
  );
}

export default TakeQuiz;
