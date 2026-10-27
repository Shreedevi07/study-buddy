
import { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm Study Buddy. What would you like to learn today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    setMessages((previous) => [...previous, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const baseUrl = "http://127.0.0.1:8000";
      const appName = "study_buddy";
      const userId = "student";
      const sessionId = "study-session-1";

      // Create the session. If it already exists, continue.
      const sessionResponse = await fetch(
        `${baseUrl}/apps/${appName}/users/${userId}/sessions/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!sessionResponse.ok && sessionResponse.status !== 409) {
        throw new Error(
          `Session error ${sessionResponse.status}: ${await sessionResponse.text()}`
        );
      }

      // Send the question to the ADK agent.
      const response = await fetch(`${baseUrl}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_name: appName,
          user_id: userId,
          session_id: sessionId,
          new_message: {
            role: "user",
            parts: [{ text }],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Agent error ${response.status}: ${await response.text()}`
        );
      }

      const data = await response.json();

      const answer = data
        .filter((item) => item.content?.role === "model")
        .flatMap((item) => item.content.parts || [])
        .map((part) => part.text || "")
        .filter(Boolean)
        .join("\n");

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: answer || "The agent returned no text. Please try again.",
        },
      ]);
    } catch (error) {
      console.error("Study Buddy error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `Connection error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([
      {
        role: "assistant",
        text: "Hi! I'm Study Buddy. What would you like to learn today?",
      },
    ]);
    setInput("");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">✦ Study Buddy</h2>
        <button className="new-chat" onClick={newChat}>
          + New chat
        </button>

        <p className="sidebar-label">YOUR SPACE</p>
        <div className="nav-item active">💬 Chat</div>
        <div className="nav-item">📝 My Notes</div>
        <div className="nav-item">🧠 Practice Quizzes</div>
        <div className="nav-item">📅 Study Planner</div>

        <div className="sidebar-footer">
          Your personal AI study assistant ✨
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>Study Space</span>
          <span className="status">
            <span className="status-dot" />
            {loading ? "Thinking..." : "Ready to learn"}
          </span>
        </header>

        <section className="chat">
          <div className="welcome">
            <div className="welcome-icon">✦</div>
            <h1>Your personal study space</h1>
            <p>
              Ask questions, understand concepts, and learn at your own pace.
            </p>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div className={`message-row ${message.role}`} key={index}>
                {message.role === "assistant" && (
                  <div className="avatar">✦</div>
                )}
                <div className="message-bubble">{message.text}</div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant">
                <div className="avatar">✦</div>
                <div className="message-bubble">Thinking...</div>
              </div>
            )}
          </div>

          <div className="suggestions">
            <button onClick={() => setInput("Explain a difficult topic")}>
              Explain a topic
            </button>
            <button onClick={() => setInput("Quiz me on what I studied")}>
              Make a quiz
            </button>
            <button onClick={() => setInput("Summarize my notes")}>
              Summarize notes
            </button>
          </div>

          <form className="input-area" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me anything about your studies..."
              aria-label="Your message"
            />
            <button type="submit" disabled={!input.trim() || loading}>
              {loading ? "Thinking..." : "Send ↑"}
            </button>
          </form>

          <p className="disclaimer">
            Study Buddy can make mistakes. Check important information.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
