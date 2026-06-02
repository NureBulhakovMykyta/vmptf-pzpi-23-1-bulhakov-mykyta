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

  const [filterSearch, setFilterSearch] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterSort, setFilterSort] = useState('newest');

  const [showLogs, setShowLogs] = useState(false);
  const [logsData, setLogsData] = useState([]);

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);
  useEffect(() => { if (chatUser) fetchMessages(); }, [chatUser]);

  const fetchData = async () => {
    try {
      let url = new URL('https://vmptf-lab2-backend.onrender.com/api/posts');
      if (filterSearch) url.searchParams.append('search', filterSearch);
      if (filterAuthor) url.searchParams.append('author', filterAuthor);
      if (filterSort) url.searchParams.append('sortBy', filterSort);

      const postsRes = await fetch(url.toString());
      const postsData = await postsRes.json();
      
      if (Array.isArray(postsData)) {
        setPosts(postsData);
      } else {
        setPosts([]);
      }

      const usersRes = await fetch('https://vmptf-lab2-backend.onrender.com/api/users');
      const usersData = await usersRes.json();
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
        setCurrentUser(prev => {
          if (!prev) return null;
          const updatedMe = usersData.find(u => u.username === prev.username);
          return updatedMe ? { ...prev, ...updatedMe } : prev;
        });
      }
    } catch (error) { 
      console.error(error); 
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`https://vmptf-lab2-backend.onrender.com/api/logs?adminUser=${currentUser.username}`);
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setLogsData(data);
        setShowLogs(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    fetchData();
  };

  const resetFilters = () => {
    setFilterSearch('');
    setFilterAuthor('');
    setFilterSort('newest');
    fetch('https://vmptf-lab2-backend.onrender.com/api/posts')
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    const res = await fetch(`https://vmptf-lab2-backend.onrender.com${endpoint}`, {
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
    await fetch('https://vmptf-lab2-backend.onrender.com/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: currentUser.username, text: newPostText }) });
    setNewPostText(''); fetchData();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Видалити пост?')) return;
    await fetch(`https://vmptf-lab2-backend.onrender.com/api/posts/${postId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username }) });
    fetchData();
  };

  const handleSaveEditPost = async (postId) => {
    await fetch(`https://vmptf-lab2-backend.onrender.com/api/posts/${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username, text: editPostText }) });
    setEditingPost(null); fetchData();
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;
    await fetch(`https://vmptf-lab2-backend.onrender.com/api/posts/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: currentUser.username, text }) });
    setCommentInputs({ ...commentInputs, [postId]: '' }); fetchData();
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Видалити коментар?')) return;
    await fetch(`https://vmptf-lab2-backend.onrender.com/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username }) });
    fetchData();
  };

  const handleSaveEditComment = async (postId, commentId) => {
    await fetch(`https://vmptf-lab2-backend.onrender.com/api/posts/${postId}/comments/${commentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username, text: editCommentText }) });
    setEditingComment(null); fetchData();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) { setSearchResults(null); return; }
    const res = await fetch(`https://vmptf-lab2-backend.onrender.com/api/search?q=${searchQuery}`);
    setSearchResults(await res.json());
  };

  const handleAddFriend = async (friendName) => {
    await fetch(`https://vmptf-lab2-backend.onrender.com/api/users/${currentUser.username}/friends`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ friendName }) });
    fetchData();
  };

  const fetchMessages = async () => {
    const res = await fetch(`https://vmptf-lab2-backend.onrender.com/api/messages/${currentUser.username}/${chatUser}`);
    setChatMessages(await res.json());
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await fetch('https://vmptf-lab2-backend.onrender.com/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender: currentUser.username, receiver: chatUser, text: newMessageText }) });
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
        <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Привіт, <b>{currentUser.username}</b>!</span>
          
          {currentUser.role === 'admin' && (
            <button 
              type="button" 
              onClick={() => showLogs ? setShowLogs(false) : fetchLogs()} 
              style={{ background: '#333', color: 'white', padding: '5px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              {showLogs ? '⬅ Назад до сайту' : '⚙️ Моніторинг (Логи)'}
            </button>
          )}

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
          {showLogs ? (
            <div className="admin-logs" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0 }}>Системні Логи (Останні 100 запитів)</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ccc', background: '#f4f6f8' }}>
                    <th style={{ padding: '10px' }}>Метод</th>
                    <th style={{ padding: '10px' }}>URL (Ендпоінт)</th>
                    <th style={{ padding: '10px' }}>Статус</th>
                    <th style={{ padding: '10px' }}>Час виконання</th>
                    <th style={{ padding: '10px' }}>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: log.method === 'DELETE' ? 'red' : (log.method === 'POST' ? 'green' : 'blue') }}>
                        {log.method}
                      </td>
                      <td style={{ padding: '10px' }}>{log.url}</td>
                      <td style={{ padding: '10px', color: log.status >= 400 ? 'red' : 'green', fontWeight: 'bold' }}>
                        {log.status}
                      </td>
                      <td style={{ padding: '10px' }}>{log.response_time_ms} ms</td>
                      <td style={{ padding: '10px', color: '#666' }}>
                        {new Date(log.created_at).toLocaleString('uk-UA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="filter-panel" style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <b>Фільтри:</b>
                <input 
                  type="text" 
                  placeholder="Слово в пості..." 
                  value={filterSearch} 
                  onChange={e => setFilterSearch(e.target.value)} 
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                />
                <input 
                  type="text" 
                  placeholder="Ім'я автора..." 
                  value={filterAuthor} 
                  onChange={e => setFilterAuthor(e.target.value)} 
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                />
                <select 
                  value={filterSort} 
                  onChange={e => setFilterSort(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="newest">Спочатку нові</option>
                  <option value="popular">Популярні (Лайки)</option>
                </select>
                <button onClick={applyFilters} type="button" style={{ padding: '8px 15px', background: '#1877f2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Застосувати</button>
                <button onClick={resetFilters} type="button" style={{ padding: '8px 15px', background: '#e4e6eb', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Скинути</button>
              </div>

              {!searchResults && (
                <div className="create-post" style={{ marginBottom: '20px' }}>
                  <h3>Що нового?</h3>
                  <form onSubmit={handleCreatePost}>
                    <textarea 
                      placeholder="Напишіть щось..." 
                      value={newPostText} 
                      onChange={(e) => setNewPostText(e.target.value)} 
                      required 
                    />
                    <button type="submit">Опублікувати</button>
                  </form>
                </div>
              )}

              <div className="posts">
                <h3>{searchResults ? 'Результати пошуку:' : 'Стрічка новин'}</h3>
                {displayPosts.map(post => {
                  const isMyPost = post.author === currentUser.username;
                  const isEditingThisPost = editingPost === post.id;

                  return (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <span className="post-author"><b>{post.author}</b> пише:</span>
                        <div className="actions">
                          <button 
                            type="button" 
                            onClick={async () => {
                              await fetch(`https://vmptf-lab2-backend.onrender.com/api/posts/${post.id}/likes`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ username: currentUser.username })
                              });
                              fetchData();
                            }} 
                            style={{ background: '#ff4757', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginRight: '5px' }}
                          >
                            ❤️ {post.likesCount}
                          </button>

                          {isMyPost && !isEditingThisPost && (
                            <>
                              <button onClick={() => {setEditingPost(post.id); setEditPostText(post.text);}} className="edit-btn">Ред.</button>
                              <button onClick={() => handleDeletePost(post.id)} className="delete-btn">Х</button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditingThisPost ? (
                        <div className="edit-box">
                          <textarea value={editPostText} onChange={(e) => setEditPostText(e.target.value)} />
                          <button onClick={() => handleSaveEditPost(post.id)}>Зберегти</button>
                          <button onClick={() => setEditingPost(null)} className="cancel-btn">Скасувати</button>
                        </div>
                      ) : (
                        <div className="post-text">{post.text}</div>
                      )}
                      
                      <div className="comments-section">
                        <h4>Коментарі ({post.comments.length}):</h4>
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
                                      <button onClick={() => {setEditingComment(c.id); setEditCommentText(c.text)}} className="edit-btn">✎</button>
                                      <button onClick={() => handleDeleteComment(post.id, c.id)} className="delete-btn">Х</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        <div className="add-comment">
                          <input 
                            type="text" 
                            placeholder="Ваш коментар..." 
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                          />
                          <button onClick={() => handleAddComment(post.id)}>Відправити</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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