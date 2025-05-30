


const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('./db/database.sqlite');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        image TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        image TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT
    )`);
});

// Регистрация
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function (err) {
        if (err) return res.status(400).send('Пользователь уже существует');
        req.session.userId = this.lastID;
        res.sendStatus(200);
    });
});

// Логин
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (!user) return res.status(400).send('Пользователь не найден');

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).send('Неверный пароль');

        req.session.userId = user.id;
        res.sendStatus(200);
    });
});

// Получение растений
app.get('/plants', (req, res) => {
    db.all('SELECT * FROM plants', [], (err, rows) => {
        res.json(rows);
    });
});

// Получение истории
app.get('/history', (req, res) => {
    db.all('SELECT * FROM history', (err, rows) => {
      if (err) {
        console.error('Ошибка получения истории', err);
        return res.status(500).send('Ошибка получения истории');
      }
      res.json(rows);
    });
  });

// Получение предложений
app.get('/offers', (req, res) => {
    db.all('SELECT * FROM offers', [], (err, rows) => {
        res.json(rows.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            image: '/uploads/' + path.basename(r.image)
        })));
    });
});

// Добавление объявления
app.post('/add-offer', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const imagePath = req.file.path;

    db.run('INSERT INTO offers (title, description, image) VALUES (?, ?, ?)', [title, description, imagePath], (err) => {
        if (err) return res.status(500).send('Ошибка при добавлении');
        res.sendStatus(200);
    });
});

app.post('/respond-offer', (req, res) => {
    const { id, title } = req.body;

    console.log('Пришел отклик:', id, title); // <-- добавил логирование

    db.run('INSERT INTO history (description) VALUES (?)', [`Отклик на объявление: ${title}`], (err) => {
        if (err) {
            console.error('Ошибка добавления в историю', err);
            return res.status(500).send('Ошибка добавления в историю');
        }

        db.run('DELETE FROM offers WHERE id = ?', [id], (err2) => {
            if (err2) {
                console.error('Ошибка удаления объявления', err2);
                return res.status(500).send('Ошибка удаления объявления');
            }
            console.log('Отклик обработан успешно');
            res.sendStatus(200);
        });
    });
});



app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
