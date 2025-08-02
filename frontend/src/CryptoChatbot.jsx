"use client"

import { useState, useRef, useEffect } from "react"

export default function CryptoChatbot() {
  const [userInput, setUserInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestedMessages = [
    "📈 Show me top 10 cryptocurrencies",
    "💰 What's the price of Bitcoin?",
    "🚀 Bitcoin chart for 7 days",
    "📊 Solana market cap",
    "📰 Latest crypto news",
    "🌍 Global market stats",
  ]

  const sendMessage = async (message = userInput) => {
    if (!message.trim()) return

    const messageToSend = message || userInput
    setMessages((prev) => [...prev, { sender: "user", type: "text", text: messageToSend }])
    setUserInput("")
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      })
      const data = await res.json()

      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", ...data }])
        setIsLoading(false)
      }, 500)
    } catch (err) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", type: "text", text: "❌ Network error. Please try again." }])
        setIsLoading(false)
      }, 500)
    }
  }

  const handleSuggestedMessage = (message) => {
    sendMessage(message)
  }

  const renderMessage = (msg, idx) => {
    switch (msg.type) {
      case "text":
        return (
          <div key={idx} className={`message-container ${msg.sender}`}>
            <div>
              <div className={`message-bubble ${msg.sender}`}>
                <p>{msg.reply || msg.text}</p>
              </div>
              <div className={`message-label ${msg.sender}`}>{msg.sender === "user" ? "You" : "🤖 CryptoBot"}</div>
            </div>
          </div>
        )

      case "table":
        return (
          <div key={idx} className="message-container bot">
            <div className="table-container">
              <div className="table-wrapper">
                <div className="table-header">
                  <span className="table-icon">📊</span>
                  <h3 className="table-title">{msg.title}</h3>
                </div>
                <div className="table-scroll">
                  <table className="crypto-table">
                    <thead>
                      <tr>
                        <th>💎 Name</th>
                        <th>💰 Price</th>
                        <th>{msg.data[0]?.change !== undefined ? "📈 Change" : "🏦 Market Cap"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {msg.data.map((coin, i) => (
                        <tr key={i}>
                          <td className="coin-name">{coin.name}</td>
                          <td className="coin-price">${coin.price.toLocaleString()}</td>
                          <td
                            className={`price-change ${
                              coin.change !== undefined ? (coin.change > 0 ? "positive" : "negative") : "neutral"
                            }`}
                          >
                            {coin.change !== undefined ? (
                              <>
                                <span className="change-icon">{coin.change > 0 ? "📈" : "📉"}</span>
                                <span>{coin.change.toFixed(2)}%</span>
                              </>
                            ) : (
                              `$${(coin.mcap / 1_000_000).toFixed(1)}M`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="message-label bot">🤖 CryptoBot</div>
            </div>
          </div>
        )

      case "chart":
        return (
          <div key={idx} className="message-container bot">
            <div className="chart-container">
              <div className="chart-wrapper">
                <div className="chart-header">
                  <span className="chart-icon">📈</span>
                  <h3 className="chart-title">{msg.title}</h3>
                </div>
                <div className="chart-content">
                  <div className="simple-chart">
                    {msg.data.map((point, i) => (
                      <div key={i} className="chart-point">
                        <div className="chart-date">{point.date}</div>
                        <div className="chart-price">${point.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <p className="chart-note">
                    💡 This is a simple price list. For advanced charts, consider integrating Chart.js or similar
                    library.
                  </p>
                </div>
              </div>
              <div className="message-label bot">🤖 CryptoBot</div>
            </div>
          </div>
        )

      case "news":
        return (
          <div key={idx} className="message-container bot">
            <div className="news-container">
              <div className="news-wrapper">
                <div className="news-header">
                  <span className="news-icon">📰</span>
                  <h3 className="news-title">{msg.title}</h3>
                </div>
                <div className="news-content">
                  {msg.data.map((item, i) => (
                    <div key={i} className="news-item">
                      <h4 className="news-item-title">{item.title}</h4>
                      <p className="news-item-description">{item.description}</p>
                      <div className="news-item-meta">
                        <span className="news-coin">
                          {item.coin} ({item.symbol})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="message-label bot">🤖 CryptoBot</div>
            </div>
          </div>
        )

      case "market_info":
        return (
          <div key={idx} className="message-container bot">
            <div className="market-info-container">
              <div className="market-info-wrapper">
                <div className="market-info-header">
                  <span className="market-info-icon">📊</span>
                  <h3 className="market-info-title">{msg.title}</h3>
                </div>
                <div className="market-info-grid">
                  {msg.data.map((item, i) => (
                    <div key={i} className="market-info-item">
                      <div className="market-info-icon-container">
                        <span className="market-info-emoji">{item.icon}</span>
                      </div>
                      <div className="market-info-content">
                        <div className="market-info-metric">{item.metric}</div>
                        <div className="market-info-value">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="message-label bot">🤖 CryptoBot</div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="crypto-chatbot-container">
      <div className="crypto-chatbot-wrapper">
        <div className="crypto-header">
          <h1 className="crypto-title">🚀 CryptoBot AI</h1>
          <p className="crypto-subtitle">Your intelligent cryptocurrency assistant</p>
        </div>

        <div className="chat-container">
          <div className="messages-area">
            <div className="messages-space">
              {messages.length === 0 && (
                <div className="welcome-screen">
                  <div className="welcome-emoji">🤖</div>
                  <h3 className="welcome-title">Welcome to CryptoBot!</h3>
                  <p className="welcome-description">Ask me about prices, charts, market caps, news, and more!</p>

                  <div className="suggestions-container">
                    <p className="suggestions-label">Try these suggestions:</p>
                    <div className="suggestions-grid">
                      {suggestedMessages.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestedMessage(suggestion)}
                          className="suggestion-button"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => renderMessage(msg, idx))}

              {isLoading && (
                <div className="loading-container">
                  <div className="loading-bubble">
                    <div className="loading-content">
                      <div className="loading-dots">
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                      </div>
                      <span className="loading-text">CryptoBot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="input-area">
            {messages.length > 0 && (
              <div className="quick-actions">
                <p className="quick-actions-label">Quick actions:</p>
                <div className="quick-actions-buttons">
                  {suggestedMessages.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedMessage(suggestion)}
                      className="quick-action-button"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="input-container">
              <input
                type="text"
                className="message-input"
                placeholder="💬 Ask about prices, charts, market caps, news..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                disabled={isLoading}
              />
              <button onClick={() => sendMessage()} disabled={isLoading || !userInput.trim()} className="send-button">
                {isLoading ? <div className="send-spinner"></div> : <span>Send 🚀</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p className="footer-text">💡 Powered by AI • Real-time crypto data • Secure & Fast</p>
        </div>
      </div>
    </div>
  )
}
