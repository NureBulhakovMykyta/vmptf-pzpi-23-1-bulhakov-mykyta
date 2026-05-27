const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const DB_FILE = './db.json';

app.use(compression());
app.use(cors());
app.use(express.json());

async function readDB() {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const db = await readDB();
    if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'Користувач вже існує' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, password: hashedPassword, friends: [] };
    db.users.push(newUser);
    await writeDB(db);
    res.json({ id: newUser.id, username: newUser.username, friends: newUser.friends });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const db = await readDB();
    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(400).json({ error: 'Користувача не знайдено' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Невірний пароль' });
    res.json({ id: user.id, username: user.username, friends: user.friends });
});

app.get('/api/users', async (req, res) => {
    const db = await readDB();
    res.json(db.users.map(u => ({ id: u.id, username: u.username, friends: u.friends })));
});

app.get('/api/posts', async (req, res) => {
    const db = await readDB();
    res.json(db.posts);
});

app.post('/api/posts', async (req, res) => {
    const db = await readDB();
    const newPost = { id: Date.now(), author: req.body.author, text: req.body.text, comments: [] };
    db.posts.unshift(newPost);
    await writeDB(db);
    res.json(newPost);
});

app.delete('/api/posts/:id', async (req, res) => {
    const db = await readDB();
    const postIndex = db.posts.findIndex(p => p.id === parseInt(req.params.id));
    if (postIndex === -1 || db.posts[postIndex].author !== req.body.username) return res.status(403).json({ error: 'Помилка' });
    db.posts.splice(postIndex, 1);
    await writeDB(db);
    res.json({ success: true });
});

app.put('/api/posts/:id', async (req, res) => {
    const db = await readDB();
    const post = db.posts.find(p => p.id === parseInt(req.params.id));
    if (!post || post.author !== req.body.username) return res.status(403).json({ error: 'Помилка' });
    post.text = req.body.text;
    await writeDB(db);
    res.json(post);
});

app.post('/api/posts/:id/comments', async (req, res) => {
    const db = await readDB();
    const post = db.posts.find(p => p.id === parseInt(req.params.id));
    if (post) {
        post.comments.push({ id: Date.now(), author: req.body.author, text: req.body.text });
        await writeDB(db);
        res.json(post);
    } else {
        res.status(404).json({ error: 'Пост не знайдено' });
    }
});

app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
    const db = await readDB();
    const post = db.posts.find(p => p.id === parseInt(req.params.postId));
    const commentIndex = post.comments.findIndex(c => c.id === parseInt(req.params.commentId));
    if (post.comments[commentIndex].author !== req.body.username) return res.status(403).json({ error: 'Помилка' });
    post.comments.splice(commentIndex, 1);
    await writeDB(db);
    res.json(post);
});

app.put('/api/posts/:postId/comments/:commentId', async (req, res) => {
    const db = await readDB();
    const post = db.posts.find(p => p.id === parseInt(req.params.postId));
    const comment = post.comments.find(c => c.id === parseInt(req.params.commentId));
    if (comment.author !== req.body.username) return res.status(403).json({ error: 'Помилка' });
    comment.text = req.body.text;
    await writeDB(db);
    res.json(post);
});

app.post('/api/users/:username/friends', async (req, res) => {
    const db = await readDB();
    const user = db.users.find(u => u.username === req.params.username);
    const friend = db.users.find(u => u.username === req.body.friendName);

    if (user && friend && !user.friends.includes(friend.username)) {
        user.friends.push(friend.username);
        friend.friends.push(user.username);
        await writeDB(db);
        res.json(user);
    } else {
        res.status(400).json({ error: 'Помилка додавання в друзі' });
    }
});

app.get('/api/search', async (req, res) => {
    const db = await readDB();
    const query = req.query.q.toLowerCase();
    const foundUsers = db.users.filter(u => u.username.toLowerCase().includes(query)).map(u => ({ id: u.id, username: u.username, friends: u.friends }));
    const foundPosts = db.posts.filter(p => p.text.toLowerCase().includes(query) || p.author.toLowerCase().includes(query));
    res.json({ users: foundUsers, posts: foundPosts });
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
    const db = await readDB();
    const { user1, user2 } = req.params;
    const chat = db.messages.filter(m => 
        (m.sender === user1 && m.receiver === user2) || (m.sender === user2 && m.receiver === user1)
    );
    res.json(chat);
});

app.post('/api/messages', async (req, res) => {
    const db = await readDB();
    const newMessage = { id: Date.now(), sender: req.body.sender, receiver: req.body.receiver, text: req.body.text };
    db.messages.push(newMessage);
    await writeDB(db);
    res.json(newMessage);
});

app.listen(PORT, () => console.log(`Сервер працює: http://localhost:${PORT}`));