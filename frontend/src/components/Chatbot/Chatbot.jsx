import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm the Piyakaru Hotel assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [context, setContext] = useState({}); // Store conversation context
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleChat = () => {
        if (isOpen) {
            // Reset chat when closing
            setMessages([
                { text: "Hello! I'm the Piyakaru Hotel assistant. How can I help you today?", sender: 'bot' }
            ]);
            setContext({});
            setInput("");
        }
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Send current context with the message
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.text, context: context }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Update context for the next turn
            if (data.context) {
                setContext(data.context);
            }

            const botMessage = { text: data.response, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

            // Handle actions if needed (e.g. showing cards for rooms)
            if (data.action === 'show_rooms' && data.data) {
                const roomList = data.data.map(room => `• ${room.name} (LKR ${room.pricePerNight})`).join('\n');
                setMessages(prev => [...prev, { text: roomList, sender: 'bot' }]);
            }
            if (data.action === 'show_dining' && data.data) {
                const diningList = data.data.map(d => `• ${d.name} (LKR ${d.price})`).join('\n');
                setMessages(prev => [...prev, { text: diningList, sender: 'bot' }]);
            }
            if (data.action === 'show_events' && data.data) {
                const eventList = data.data.map(e => `• ${e.name} (LKR ${e.basePrice})`).join('\n');
                setMessages(prev => [...prev, { text: eventList, sender: 'bot' }]);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { text: "I'm having trouble connecting to the server. Please try again later.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>Hotel Assistant</h3>
                        <button onClick={toggleChat}>&times;</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div className="message-bubble">
                                    {msg.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < msg.text.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="message-bubble typing">...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
            <button className="chatbot-toggle" onClick={toggleChat}>
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                )}
            </button>
        </div>
    );
}
