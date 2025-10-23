import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import InputBar from './InputBar';
import '../chatbot.css';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// ✅ Lambda function URL
const LAMBDA_URL =
  'https://off3lgycln5ngczdobcg5j7bui0ifjju.lambda-url.us-east-1.on.aws/';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hi there, ask me anything',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('chat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Send message (and resume, if attached) to Lambda
  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response;

      if (uploadedFile) {
        const formData = new FormData();
        formData.append('message', content);
        formData.append('file', uploadedFile);

        response = await fetch(LAMBDA_URL, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(LAMBDA_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
        });
      }

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      // ✅ Safe JSON parsing (handles malformed or extra data)
      const text = await response.text();
      console.log("Raw Lambda response:", text);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error:", e, "Raw text:", text);
        data = { reply: text };
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          data.reply || 'Sorry, I didn’t get a response from the AI agent.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          'There was a problem connecting to the server. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
      setUploadedFile(null);
    }
  };

  // ✅ Quick start buttons
  const handleQuickStart = (message: string) => {
    handleSendMessage(message);
  };

  // ✅ Resume upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: `✅ Uploaded "${file.name}". I’ll include it with your next message.`,
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    setTimeout(() => setIsUploading(false), 1000);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const quickStartOptions = [
    'Resume Advice',
    'Job Search',
    'Course Planning',
    'Interview Prep',
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'contact':
        return (
          <div className="page-content">
            <h2>Contact Us</h2>
            <div className="contact-info">
              <p><strong>Email:</strong> advisor@utdallas.edu</p>
              <p><strong>Phone:</strong> (972) 883-2111</p>
              <p><strong>Office Hours:</strong> Monday-Friday, 9:00 AM - 5:00 PM</p>
              <p><strong>Location:</strong> Student Services Building, Room 1.200</p>
            </div>
            <div className="contact-methods">
              <h3>Get Help</h3>
              <ul>
                <li>Schedule an appointment through MyUTD</li>
                <li>Visit our walk-in hours</li>
                <li>Email us for quick questions</li>
                <li>Call for urgent matters</li>
              </ul>
            </div>
          </div>
        );

      case 'aws-bedrock':
        return (
          <div className="page-content">
            <h2>Meet the Team</h2>
            <div className="contact-info">
              <p>
                EIDA was developed by a group of passionate UTD students who combined
                computer science, AI, and user-centered design to create a personalized
                advising experience for students.
              </p>
            </div>
            <div className="contact-methods">
              <h3>Developers</h3>
              <ul>
                <li>
                  <a
                    href="https://www.linkedin.com/in/riley-mckinney/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-link"
                  >
                    Riley McKinney
                  </a>{' '}
                  — Software Engineer • AI Systems & Full-Stack Development
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/hadi-khan05/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-link"
                  >
                    Hadi Khan
                  </a>{' '}
                  — AI Research & Data Science • Model Development & Analysis
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/khanyumna/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-link"
                  >
                    Yumna Khan
                  </a>{' '}
                  — Frontend Developer • UX Design & Cloud Integration
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <>
            <div className="window-controls">
              <div className="window-control close"></div>
              <div className="window-control minimize"></div>
              <div className="window-control maximize"></div>
            </div>

            <div className="chat-area">
              {messages.map(message => (
                <Message
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  id={message.id}
                />
              ))}

              {isLoading && (
                <div className="loading-indicator">
                  <div className="loading-dots">
                    <div className="loading-dots-content">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="quick-start-section">
              {quickStartOptions.map((option, index) => (
                <button
                  key={index}
                  className="quick-start-button"
                  onClick={() => handleQuickStart(`I need help with ${option.toLowerCase()}`)}
                >
                  {option}
                </button>
              ))}
            </div>

            <InputBar
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              onFileUpload={handleFileUpload}
              triggerFileUpload={triggerFileUpload}
              isUploading={isUploading}
              uploadedFile={uploadedFile}
              fileInputRef={fileInputRef}
            />
          </>
        );
    }
  };

  return (
    <div className={`chatbot-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">EIDA</h1>
          <p className="sidebar-subtitle">the UTD advisor</p>
        </div>

        <div className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`nav-item ${currentPage === 'contact' ? 'active' : ''}`}
            onClick={() => setCurrentPage('contact')}
          >
            📞 Contact
          </button>
          <button
            className={`nav-item ${currentPage === 'aws-bedrock' ? 'active' : ''}`}
            onClick={() => setCurrentPage('aws-bedrock')}
          >
            ⚡ Meet the Team
          </button>
        </div>

        <div className="theme-toggle-section">
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="sidebar-footer">
          <p className="footer-text">© 2025 UTDallas</p>
        </div>
      </div>

      <div className="main-chat-area">{renderPage()}</div>
    </div>
  );
};

export default ChatBot;
