const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// 模拟数据库
const users = [];

// 注册用户
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // 检查用户名是否已存在
        if (users.some(user => user.username === username)) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 保存用户
        const user = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            email
        };
        users.push(user);

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ error: '注册失败' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 查找用户
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        // 验证密码
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        // 生成JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: '登录失败' });
    }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
