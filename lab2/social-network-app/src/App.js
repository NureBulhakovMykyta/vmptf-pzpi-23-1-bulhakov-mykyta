import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const [editingPost, setEditingPost] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const [chatUser, setChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);
  useEffect(() => { if (chatUser) fetchMessages(); }, [chatUser]);

  const fetchData = async () => {
    try {
      const postsRes = await fetch('http://localhost:3001/api/posts');
      setPosts(await postsRes.json());
      const usersRes = await fetch('http://localhost:3001/api/users');
      const loadedUsers = await usersRes.json();
      setUsers(loadedUsers);
      setCurrentUser(prev => {
        if (!prev) return null;
        return loadedUsers.find(u => u.username === prev.username) || prev;
      });
    } catch (error) { console.error(error); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    const res = await fetch(`http://localhost:3001${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    else { setCurrentUser(data); setPasswordInput(''); }
  };

  const handleLogout = () => {
    setCurrentUser(null); setUsernameInput(''); setPasswordInput('');
    setChatUser(null); setSearchResults(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3001/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: currentUser.username, text: newPostText }) });
    setNewPostText(''); fetchData();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Видалити пост?')) return;
    await fetch(`http://localhost:3001/api/posts/${postId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username }) });
    fetchData();
  };

  const handleSaveEditPost = async (postId) => {
    await fetch(`http://localhost:3001/api/posts/${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username, text: editPostText }) });
    setEditingPost(null); fetchData();
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;
    await fetch(`http://localhost:3001/api/posts/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: currentUser.username, text }) });
    setCommentInputs({ ...commentInputs, [postId]: '' }); fetchData();
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Видалити коментар?')) return;
    await fetch(`http://localhost:3001/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username }) });
    fetchData();
  };

  const handleSaveEditComment = async (postId, commentId) => {
    await fetch(`http://localhost:3001/api/posts/${postId}/comments/${commentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username, text: editCommentText }) });
    setEditingComment(null); fetchData();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) { setSearchResults(null); return; }
    const res = await fetch(`http://localhost:3001/api/search?q=${searchQuery}`);
    setSearchResults(await res.json());
  };

  const handleAddFriend = async (friendName) => {
    await fetch(`http://localhost:3001/api/users/${currentUser.username}/friends`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ friendName }) });
    fetchData();
  };

  const fetchMessages = async () => {
    const res = await fetch(`http://localhost:3001/api/messages/${currentUser.username}/${chatUser}`);
    setChatMessages(await res.json());
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3001/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender: currentUser.username, receiver: chatUser, text: newMessageText }) });
    setNewMessageText(''); fetchMessages();
  };

  if (!currentUser) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleAuth}>
          <h2>{isLoginMode ? 'Вхід' : 'Реєстрація'}</h2>
          <input type="text" placeholder="Ім'я" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} required />
          <input type="password" placeholder="Пароль" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required />
          <button type="submit">{isLoginMode ? 'Увійти' : 'Зареєструватися'}</button>
          <p className="auth-toggle" onClick={() => setIsLoginMode(!isLoginMode)}>{isLoginMode ? 'Реєстрація' : 'Вхід'}</p>
        </form>
      </div>
    );
  }

  const displayPosts = searchResults ? searchResults.posts : posts;
  const displayUsers = searchResults ? searchResults.users : users;

  return (
    <div className="app-container">
      <header className="header">
        <h1>Соціальна мережа</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input type="text" placeholder="Пошук..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit">Знайти</button>
          {searchResults && <button type="button" className="clear-btn" onClick={() => { setSearchResults(null); setSearchQuery(''); }}>Скас.</button>}
        </form>
        <div className="user-info">
          <span>Привіт, <b>{currentUser.username}</b></span>
          <button type="button" className="logout-btn" onClick={handleLogout}>Вийти</button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <h3>Користувачі</h3>
          <ul className="user-list">
            {displayUsers.map(user => {
              const isMe = user.username === currentUser.username;
              const isFriend = currentUser.friends?.includes(user.username);
              return (
                <li key={user.id} className={isFriend ? 'friend-item' : ''}>
                  <div>👤 <b>{user.username}</b> {isFriend && '🌟'}</div>
                  {!isMe && (
                    <div className="user-actions">
                      {!isFriend && <button onClick={() => handleAddFriend(user.username)}>+Друг</button>}
                      <button onClick={() => setChatUser(user.username)}>✉️</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="feed">
          {!searchResults && (
            <div className="create-post">
              <h3>Створити публікацію</h3>
              <form onSubmit={handleCreatePost}>
                <textarea placeholder="Напишіть щось..." value={newPostText} onChange={(e) => setNewPostText(e.target.value)} required />
                <button type="submit">Опублікувати</button>
              </form>
            </div>
          )}

          <div className="posts">
            <h3>{searchResults ? 'Результати пошуку:' : 'Стрічка'}</h3>
            {displayPosts.map(post => {
              const isMyPost = post.author === currentUser.username;
              const isEditingThisPost = editingPost === post.id;

              return (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="post-author"><b>{post.author}</b> пише:</span>
                    {isMyPost && !isEditingThisPost && (
                      <div className="actions">
                        <button onClick={() => { setEditingPost(post.id); setEditPostText(post.text); }} className="edit-btn">Ред.</button>
                        <button onClick={() => handleDeletePost(post.id)} className="delete-btn">Х</button>
                      </div>
                    )}
                  </div>
                  {isEditingThisPost ? (
                    <div className="edit-box">
                      <textarea value={editPostText} onChange={(e) => setEditPostText(e.target.value)} />
                      <button onClick={() => handleSaveEditPost(post.id)}>Ок</button>
                      <button onClick={() => setEditingPost(null)} className="cancel-btn">Скас.</button>
                    </div>
                  ) : <div className="post-text">{post.text}</div>}

                  <div className="comments-section">
                    <h4>Коментарі:</h4>
                    {post.comments.map(c => {
                      const isMyComment = c.author === currentUser.username;
                      const isEditingThisComment = editingComment === c.id;
                      return (
                        <div key={c.id} className="comment">
                          {isEditingThisComment ? (
                            <div className="edit-box">
                              <input type="text" value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} />
                              <button onClick={() => handleSaveEditComment(post.id, c.id)}>Ок</button>
                              <button onClick={() => setEditingComment(null)} className="cancel-btn">X</button>
                            </div>
                          ) : (
                            <div className="comment-content">
                              <span><b>{c.author}:</b> {c.text}</span>
                              {isMyComment && (
                                <div className="actions">
                                  <button onClick={() => { setEditingComment(c.id); setEditCommentText(c.text) }} className="edit-btn">✎</button>
                                  <button onClick={() => handleDeleteComment(post.id, c.id)} className="delete-btn">Х</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    <div className="add-comment">
                      <input type="text" placeholder="Коментар..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} />
                      <button onClick={() => handleAddComment(post.id)}>+</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {chatUser && (
        <div className="chat-box">
          <div className="chat-header">
            <span>Чат: <b>{chatUser}</b></span>
            <button onClick={() => setChatUser(null)}>X</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={msg.sender === currentUser.username ? 'msg-my' : 'msg-their'}><b>{msg.sender}:</b> {msg.text}</div>
            ))}
          </div>
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input type="text" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} required />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;