import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); 
  const [activeRoom, setActiveRoom] = useState(null);

  const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [info, setInfo] = useState('');

    const handleRegister = (e) => {
      e.preventDefault();
      const newUser = { username, password, info };

      fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      .then(response => response.json())
      .then(data => {
        alert('Реєстрація успішна! Тепер увійдіть.');
        setCurrentView('login');
      })
      .catch(error => console.error('Помилка:', error));
    };

    return (
      <div className="container">
        <h2>Реєстрація</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>Логін: </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label>Пароль: </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label>Про себе: </label>
            <input type="text" value={info} onChange={e => setInfo(e.target.value)} />
          </div>
          <button type="submit">Зареєструватися</button>
        </form>
        <p>Вже є акаунт? <button onClick={() => setCurrentView('login')}>Увійти</button></p>
      </div>
    );
  };

  const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
      e.preventDefault();
      
      fetch('http://localhost:3001/users')
        .then(res => res.json())
        .then(users => {
          const foundUser = users.find(
            user => user.username === username && user.password === password
          );

          if (foundUser) {
            setCurrentUser(foundUser);
            setCurrentView('rooms');
          } else {
            alert('Невірний логін або пароль!');
          }
        })
        .catch(error => {
          console.error('Помилка:', error);
          alert('Помилка з\'єднання з сервером');
        });
    };

    return (
      <div className="container">
        <h2>Вхід</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Логін: </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label>Пароль: </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Увійти</button>
        </form>
        <p>Немає акаунта? <button onClick={() => setCurrentView('register')}>Створити акаунт</button></p>
      </div>
    );
  };

  const Profile = () => {
    const [newPassword, setNewPassword] = useState('');
    const [newInfo, setNewInfo] = useState(currentUser.info || '');

    const handleUpdate = (e) => {
      e.preventDefault();
      const updatedData = { info: newInfo };
      if (newPassword) {
        updatedData.password = newPassword;
      }

      fetch(`http://localhost:3001/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      .then(res => res.json())
      .then(updatedUser => {
        setCurrentUser(updatedUser);
        alert('Профіль оновлено!');
      });
    };

    return (
      <div className="container">
        <h2>Мій профіль ({currentUser.username})</h2>
        <form onSubmit={handleUpdate}>
          <div>
            <label>Нова інформація про себе: </label>
            <input type="text" value={newInfo} onChange={e => setNewInfo(e.target.value)} />
          </div>
          <div>
            <label>Новий пароль (залиште пустим, якщо не міняєте): </label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <button type="submit">Зберегти зміни</button>
        </form>
        <br/>
        <button onClick={() => setCurrentView('rooms')}>Назад до чатів</button>
      </div>
    );
  };

  const ChatRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');

    useEffect(() => {
      fetch('http://localhost:3001/rooms')
        .then(res => res.json())
        .then(data => setRooms(data));
    }, []);

    const handleCreateRoom = (e) => {
      e.preventDefault();
      const newRoom = { name: newRoomName };

      fetch('http://localhost:3001/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      })
      .then(res => res.json())
      .then(room => {
        setRooms([...rooms, room]);
        setNewRoomName('');
      });
    };

    return (
      <div className="container">
        <div className="header">
          <h2>Чат-кімнати</h2>
          <div>
            <span>Привіт, {currentUser.username}! </span>
            <button onClick={() => setCurrentView('profile')}>Профіль</button>
            <button onClick={() => {setCurrentUser(null); setCurrentView('login');}}>Вийти</button>
          </div>
        </div>

        <form onSubmit={handleCreateRoom} style={{marginBottom: '10px'}}>
          <input type="text" placeholder="Назва нової кімнати" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} required />
          <button type="submit">Створити кімнату</button>
        </form>

        <ul className="room-list">
          {rooms.map(room => (
            <li key={room.id}>
              {room.name} 
              <button onClick={() => { setActiveRoom(room); setCurrentView('chat'); }}>Увійти</button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    const fetchMessages = () => {
      fetch('http://localhost:3001/messages')
        .then(res => res.json())
        .then(allMessages => {
          const roomMessages = allMessages.filter(
            m => String(m.roomId) === String(activeRoom.id)
          );
          setMessages(roomMessages);
        })
        .catch(err => console.error(err));
    };

    useEffect(() => {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }, [activeRoom.id]);

    const sendMessage = (e) => {
      e.preventDefault();
      const newMsg = {
        roomId: String(activeRoom.id),
        author: currentUser.username,
        text: text,
        time: new Date().toLocaleTimeString()
      };

      fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      })
      .then(res => res.json())
      .then(msg => {
        setMessages([...messages, msg]);
        setText('');
      });
    };

    return (
      <div className="container">
        <h2>Кімната: {activeRoom.name}</h2>
        <button onClick={() => setCurrentView('rooms')}>Повернутися до списку</button>
        
        <div className="chat-box">
          {messages.length === 0 ? <p>Немає повідомлень</p> : null}
          {messages.map(m => (
            <div key={m.id} className="message">
              <b>{m.author}</b> <i>({m.time})</i>: <br/> {m.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage}>
          <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Ваше повідомлення..." required />
          <button type="submit">Відправити</button>
        </form>
      </div>
    );
  };

  return (
    <div>
      {currentView === 'register' && <Register />}
      {currentView === 'login' && <Login />}
      {currentView === 'profile' && currentUser && <Profile />}
      {currentView === 'rooms' && currentUser && <ChatRooms />}
      {currentView === 'chat' && currentUser && activeRoom && <Chat />}
    </div>
  );
}

export default App;