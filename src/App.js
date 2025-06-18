import React, { useState } from 'react';
import { createChatCompletion } from './services/chatService';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    setIsLoading(true);
    setError(null);

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await createChatCompletion(newMessages);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <h1>E-commerce Assistant</h1>
        <div className="instructions">
          <p>Welcome! I can help you with:</p>
          <ul>
            <li>Product information</li>
            <li>Order issues</li>
            <li>Shipping and delivery</li>
            <li>Returns and refunds</li>
            <li>Payment questions</li>
          </ul>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <strong>{message.role}:</strong> {message.content}
            </div>
          ))}
          {isLoading && <div className="loading">Thinking...</div>}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export { ErrorBoundary };
export default App;
