require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const { User, Post, Comment } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(compression());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', async () => {
        const duration = Date.now() - start;
        
        if (!req.originalUrl.includes('/api/logs')) {
            await supabase.from('logs').insert({
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                response_time_ms: duration
            });
        }
    });

    next();
});

async function getUserId(username) {
    const { data, error } = await supabase.from('users').select('id').eq('username', username).single();
    return data ? data.id : null;
}

async function getFriendsNames(userId) {
    const { data } = await supabase.from('friends').select('*').or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
    if (!data) return [];
    
    const friendIds = data.map(f => f.user_id_1 === userId ? f.user_id_2 : f.user_id_1);
    if (friendIds.length === 0) return [];

    const { data: users } = await supabase.from('users').select('username').in('id', friendIds);
    return users.map(u => u.username);
}

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existingId = await getUserId(username);
        if (existingId) return res.status(400).json({ error: 'Користувач вже існує' });

        const password_hash = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase.from('users').insert({ username, password_hash }).select().single();
        
        if (error) {
            console.error("🛑 Помилка Supabase:", error);
            return res.status(500).json({ error: 'Помилка бази даних' });
        }
        
        res.json({ id: data.id, username: data.username, friends: [] });
    } catch (err) {
        console.error("🛑 Критична помилка сервера:", err);
        res.status(500).json({ error: 'Критична помилка сервера' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
    if (!user) return res.status(400).json({ error: 'Користувача не знайдено' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Невірний пароль' });

    const friends = await getFriendsNames(user.id);
    res.json({ id: user.id, username: user.username, role: user.role, friends });
});

app.get('/api/users', async (req, res) => {
    const { data: users } = await supabase.from('users').select('id, username, role');
    
    const usersWithFriends = await Promise.all(users.map(async u => {
        const friends = await getFriendsNames(u.id);
        return { id: u.id, username: u.username, role: u.role, friends };
    }));
    
    res.json(usersWithFriends);
});

app.post('/api/users/:username/friends', async (req, res) => {
    const userId1 = await getUserId(req.params.username);
    const userId2 = await getUserId(req.body.friendName);

    if (!userId1 || !userId2 || userId1 === userId2) {
        return res.status(400).json({ error: 'Неможливо додати в друзі' });
    }

    const id1 = Math.min(userId1, userId2);
    const id2 = Math.max(userId1, userId2);

    await supabase.from('friends').insert({ user_id_1: id1, user_id_2: id2 });
    res.json({ success: true });
});

app.get('/api/posts', async (req, res) => {
    try {
        const { search, author, sortBy } = req.query;
        
        let dbQuery = supabase
            .from('posts')
            .select(`
                id, text, created_at,
                users!posts_user_id_fkey (username),
                comments (id, text, users!comments_user_id_fkey(username)),
                likes (user_id)
            `);

        if (search) {
            dbQuery = dbQuery.ilike('text', `%${search}%`);
        }

        if (author) {
            const userId = await getUserId(author);
            if (userId) {
                dbQuery = dbQuery.eq('user_id', userId);
            } else {
                return res.json([]);
            }
        }

        dbQuery = dbQuery.order('created_at', { ascending: false });

        const { data, error } = await dbQuery;
        if (error) throw error;

        let formatted = data.map(p => ({
            id: p.id,
            author: p.users?.username || 'Невідомий',
            text: p.text,
            likesCount: p.likes ? p.likes.length : 0,
            comments: (p.comments || []).map(c => ({
                id: c.id,
                author: c.users?.username || 'Невідомий',
                text: c.text
            }))
        }));

        if (sortBy === 'popular') {
            formatted.sort((a, b) => b.likesCount - a.likesCount);
        }

        res.json(formatted);
    } catch (err) {
        console.error("🛑 Помилка завантаження постів:", err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.body.author } });
        if (!user) return res.status(400).json({ error: 'Користувача не знайдено' });

        const newPost = await Post.create({
            user_id: user.id,
            text: req.body.text
        });

        res.json({ 
            id: newPost.id, 
            author: req.body.author, 
            text: newPost.text, 
            comments: [], 
            likesCount: 0 
        });
    } catch (err) {
        console.error("🛑 Помилка створення поста ORM:", err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = await getUserId(req.body.username);

    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', userId);
    if (error) return res.status(403).json({ error: 'Помилка видалення' });
    res.json({ success: true });
});

app.put('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = await getUserId(req.body.username);

    const { data } = await supabase.from('posts')
        .update({ text: req.body.text })
        .eq('id', postId).eq('user_id', userId).select().single();
        
    res.json(data);
});

app.post('/api/posts/:id/likes', async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = await getUserId(req.body.username);

    const { data: existing } = await supabase.from('likes').select('*').eq('post_id', postId).eq('user_id', userId);
    
    if (existing && existing.length > 0) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    }
    res.json({ success: true });
});

app.post('/api/posts/:id/comments', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        const user = await User.findOne({ where: { username: req.body.author } });
        if (!user) return res.status(400).json({ error: 'Користувача не знайдено' });

        const newComment = await Comment.create({
            post_id: postId,
            user_id: user.id,
            text: req.body.text
        });

        res.json(newComment);
    } catch (err) {
        console.error("🛑 Помилка додавання коментаря ORM:", err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const userId = await getUserId(req.body.username);

    await supabase.from('comments').delete().eq('id', commentId).eq('user_id', userId);
    res.json({ success: true });
});

app.put('/api/posts/:postId/comments/:commentId', async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const userId = await getUserId(req.body.username);

    await supabase.from('comments').update({ text: req.body.text }).eq('id', commentId).eq('user_id', userId);
    res.json({ success: true });
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
    const u1Id = await getUserId(req.params.user1);
    const u2Id = await getUserId(req.params.user2);

    const { data } = await supabase.from('messages')
        .select('*')
        .or(`and(sender_id.eq.${u1Id},receiver_id.eq.${u2Id}),and(sender_id.eq.${u2Id},receiver_id.eq.${u1Id})`)
        .order('created_at', { ascending: true });

    if (!data) return res.json([]);

    const formatted = data.map(m => ({
        id: m.id,
        sender: m.sender_id === u1Id ? req.params.user1 : req.params.user2,
        receiver: m.receiver_id === u1Id ? req.params.user1 : req.params.user2,
        text: m.text
    }));
    res.json(formatted);
});

app.post('/api/messages', async (req, res) => {
    const senderId = await getUserId(req.body.sender);
    const receiverId = await getUserId(req.body.receiver);

    await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, text: req.body.text });
    res.json({ success: true });
});

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        
        const { data: usersData } = await supabase.from('users').select('id, username').ilike('username', `%${query}%`);
        const formattedUsers = await Promise.all((usersData || []).map(async u => {
            return { id: u.id, username: u.username, friends: await getFriendsNames(u.id) };
        }));

        const { data: postsData, error: postsError } = await supabase.from('posts')
            .select(`
                id, text, created_at,
                users!posts_user_id_fkey (username),
                comments (id, text, users!comments_user_id_fkey(username)),
                likes (user_id)
            `)
            .ilike('text', `%${query}%`)
            .order('created_at', { ascending: false });
            
        if (postsError) {
            console.error("🛑 Помилка пошуку постів:", postsError);
        }

        const formattedPosts = (postsData || []).map(p => ({
            id: p.id, 
            author: p.users?.username || 'Невідомий', 
            text: p.text, 
            likesCount: p.likes ? p.likes.length : 0,
            comments: (p.comments || []).map(c => ({ 
                id: c.id, 
                author: c.users?.username || 'Невідомий', 
                text: c.text 
            }))
        }));

        res.json({ users: formattedUsers, posts: formattedPosts });
    } catch (err) {
        console.error("🛑 Критична помилка пошуку:", err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const username = req.query.adminUser;
        
        if (!username) {
             return res.status(400).json({ error: "Ім'я адміністратора не передано" });
        }
        
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('username', username)
            .single();
            
        if (userError) {
             console.error("🛑 Помилка перевірки ролі:", userError);
             return res.status(403).json({ error: 'Помилка доступу до користувача.' });
        }

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Доступ заборонено! Тільки для адміністраторів.' });
        }

        const { data: logs, error: logsError } = await supabase
            .from('logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
            
        if (logsError) {
            console.error("🛑 Помилка завантаження логів:", logsError);
            return res.status(500).json({ error: logsError.message });
        }
        
        res.json(logs || []);
    } catch (err) {
        console.error("🛑 Критична помилка в /api/logs:", err);
        res.status(500).json({ error: "Критична помилка сервера при отриманні логів" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер працює з БД Supabase на порту http://localhost:${PORT}`);
});