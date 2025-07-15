import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Main App containing chat UI and logic for OpenAI integration.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI chat assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isSending]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  /**
   * Handles sending a user message and fetching the assistant response from OpenAI API.
   * Uses environment variable for the API key. If direct calls are not allowed (CORS), route via backend/proxy.
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError(null);
    const userMessage = input.trim();
    if (!userMessage) return;
    setInput('');
    // Add user message to history
    const nextHistory = [
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];
    setChatHistory(nextHistory);
    setIsSending(true);

    try {
      // --- OpenAI API setup ---
      // Try to fetch from env variable. React requires REACT_APP_ prefix for process.env variables.
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

      // Prepare messages as required by OpenAI API
      const messages = nextHistory.map(msg => ({
        role: msg.role, content: msg.content
      }));

      // CORS: For security, the API key should NOT be sent from client.
      // Option 1: Direct (works ONLY if CORS is not an issue and you know what you're doing)
      // Option 2 (recommended): Proxy through backend. The code below includes a placeholder.

      // TODO: Replace the URL with your backend proxy endpoint if CORS/security restrictions block client-side access.
      // For now, if the API key exists, attempt a direct call for local/dev ONLY.
      let data;
      if (apiKey) {
        // Direct integration (unsafe for production - for demo/localdev only)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI request failed (${response.status})`);
        }
        data = await response.json();
      } else {
        // Backend/proxy placeholder example:
        /**
         * TODO: Set up a backend endpoint/api/proxy to make the OpenAI call securely.
         * Example below assumes POST /api/chat-completion with { messages }
         *
         * const response = await fetch('/api/chat-completion', {
         *   method: 'POST',
         *   headers: { 'Content-Type': 'application/json' },
         *   body: JSON.stringify({ messages })
         * });
         * data = await response.json();
         * 
         * Instructions: Backend should read the OpenAI API key from its env and not expose it to client.
         */
        throw new Error('OpenAI API key not found in environment. Provide REACT_APP_OPENAI_API_KEY or setup a backend proxy.');
      }

      if (data && data.choices && data.choices.length) {
        const aiMsg = data.choices[0].message;
        setChatHistory(history => [
          ...history,
          { role: aiMsg.role, content: aiMsg.content }
        ]);
      } else {
        throw new Error('No chat response received from OpenAI');
      }

    } catch (err) {
      setError(
        err.message?.toString() ||
        'An error occurred while communicating with the AI assistant.'
      );
    } finally {
      setIsSending(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleInputChange = (e) => setInput(e.target.value);

  // UI components
  return (
    <div className="App" style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <header className="App-header" style={{padding:'1rem 0 0 0',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border-color)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center'}}>
          <img src={logo} className="App-logo" alt="logo" style={{height: 50, marginRight: 20}}/>
          <h2 style={{margin:0, fontSize:'1.6rem'}}>KAVIA AI Chat Assistant</h2>
        </div>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main role="main" style={{
        flex:1, 
        background: 'var(--bg-primary)', 
        display:'flex', flexDirection:'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow:'hidden'
      }}>
        <div 
          className="chat-history"
          style={{
            width: "100%",
            maxWidth: 520,
            flex: 1,
            margin: "0 auto",
            display:"flex",
            flexDirection:"column",
            justifyContent:"flex-end",
            overflowY:"auto",
            padding: "1.5rem 0 1rem 0",
          }}>
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              style={{
                width: '95%',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--border-color)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                margin: '0.25rem 0',
                padding: '0.75rem 1rem',
                boxShadow: '0px 1px 4px rgba(0,0,0,0.06)'
              }}>
              <span style={{fontWeight: msg.role==='user'?600:500}}>
                {msg.role === 'user' ? 'You' : 'Assistant'}:&nbsp;
              </span>
              <span style={{whiteSpace:"pre-line"}}>
                {msg.content}
              </span>
            </div>
          ))}
          {isSending && (
            <div
              style={{
                alignSelf: 'flex-start',
                margin: '0.25rem 0',
                padding: '0.75rem 1rem',
                color: 'var(--text-secondary)',
                opacity: 0.8
              }}>
              <i>Assistant is typing<span className="dotdotdot">...</span></i>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
        {error && (
          <div style={{color:'#e87a41',fontWeight:500,margin:'0.6rem',maxWidth:400,textAlign:'center'}}>
            {error}
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          style={{
            width: '100%',
            maxWidth: 520,
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem 1.25rem 1rem',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)'
          }}>
          <input
            aria-label="Message input"
            type="text"
            placeholder={isSending? "Assistant is typing..." : "Type your message..."}
            value={input}
            onChange={handleInputChange}
            disabled={isSending}
            style={{
              flex: 1,
              fontSize: 16,
              padding: '0.7rem 1rem',
              borderRadius: 18,
              border: '1px solid var(--border-color)',
              marginRight: 10,
              outline: 'none',
              background: 'var(--bg-secondary)',
              color:'var(--text-primary)'
            }}
            autoFocus
          />
          <button
            type="submit"
            className="theme-toggle"
            style={{
              minWidth: 84,
              borderRadius: 18,
              padding: '0.7rem 1.25rem',
              fontSize: 16,
              fontWeight: 600,
              opacity: isSending ? 0.6 : 1.0,
              cursor: isSending ? "wait" : "pointer"
            }}
            disabled={isSending}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
