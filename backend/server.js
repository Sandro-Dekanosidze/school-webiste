const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'db.json');

// Initial data structure
const initialData = {
  users: [
    { email: 'sdekanosidze1010@gmail.com', password: '159951saSA', name: 'ადმინისტრატორი', role: 'admin' }
  ],
  teachers: [
    { id: 1, name: 'სანდრო დეკანოსიძე', role: 'ინფორმატიკა', email: 'sdekanosidze1010@gmail.com' },
    { id: 2, name: 'თამარ აბულაძე', role: 'მათემატიკა', email: 'tamar@school.ge' }
  ],
  students: [
    { id: 101, name: 'ლევან გვასალია', role: 'მე-12 კლასი', email: 'levan@student.ge', parentPhone: '555123456' },
    { id: 102, name: 'ნინო ბაქრაძე', role: 'მე-11 კლასი', email: 'nino@student.ge', parentPhone: '555987654' }
  ],
  news: [
    { id: 1, date: '2026-03-10', text: 'გაზაფხულის არდადეგები დაიწყება 15 მარტს.' }
  ],
  events: [
    { id: 1, date: '2026-03-21', title: 'სასკოლო ექსკურსია', type: 'holiday' },
    { id: 2, date: '2026-04-05', title: 'მათემატიკის ოლიმპიადა', type: 'exam' }
  ],
  materials: [
    { id: 1, title: 'ალგებრის სახელმძღვანელო', link: 'https://example.com/math.pdf', teacher: 'თამარ აბულაძე' }
  ],
  timetable: [],
  exams: [],
  homework: [],
  online: [],
  hostel: [],
  attendance: [],
  notifications: [],
  homework: []
};

// Ensure DB exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
} else {
  // Migration: Ensure users array exists if file already exists
  const currentData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (!currentData.users) {
    currentData.users = initialData.users;
    fs.writeFileSync(DB_PATH, JSON.stringify(currentData, null, 2));
  }
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    return initialData;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Auth ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ success: true, user: { email: user.email, name: user.name, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'არასწორი მონაცემები' });
  }
});

app.post('/api/register', (req, res) => {
  const { email, password, name, adminEmail } = req.body;
  const db = readDB();
  
  // Only the main admin can register others
  if (adminEmail !== 'sdekanosidze1010@gmail.com') {
    return res.status(403).json({ success: false, message: 'რეგისტრაციის უფლება მხოლოდ ადმინისტრატორს აქვს' });
  }

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'მომხმარებელი ამ მეილით უკვე არსებობს' });
  }

  const newUser = { email, password, name: name || 'მომხმარებელი', role: 'user' };
  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, message: 'მომხმარებელი წარმატებით დარეგისტრირდა' });
});

// --- Generic CRUD ---
const resources = [
  'teachers', 'students', 'news', 'timetable', 
  'exams', 'homework', 'online', 'hostel',
  'events', 'materials', 'attendance', 'notifications', 'users'
];

resources.forEach(resType => {
  app.get(`/api/${resType}`, (req, res) => {
    const db = readDB();
    res.json(db[resType] || []);
  });
  
  app.post(`/api/${resType}`, (req, res) => {
    const db = readDB();
    const newItem = { ...req.body, id: Date.now() };
    if (!db[resType]) db[resType] = [];
    db[resType].push(newItem);
    writeDB(db);
    res.status(201).json(newItem);
  });
  
  app.delete(`/api/${resType}/:id`, (req, res) => {
    const db = readDB();
    if (db[resType]) {
      if (resType === 'users') {
        const userToDelete = db.users.find(u => u.email === req.params.id);
        if (userToDelete && userToDelete.email === 'sdekanosidze1010@gmail.com') {
          return res.status(403).json({ success: false, message: 'მთავარი ადმინისტრატორის წაშლა შეუძლებელია' });
        }
        db.users = db.users.filter(u => u.email !== req.params.id);
      } else {
        db[resType] = db[resType].filter(item => item.id != req.params.id);
      }
      writeDB(db);
    }
    res.status(204).send();
  });

  app.put(`/api/${resType}/:id`, (req, res) => {
    const db = readDB();
    const id = req.params.id;
    if (resType === 'users') {
      const index = db.users.findIndex(u => u.email === id);
      if (index !== -1) {
        db.users[index] = { ...db.users[index], ...req.body };
        writeDB(db);
        return res.json(db.users[index]);
      }
    } else {
      const index = db[resType].findIndex(item => item.id == id);
      if (index !== -1) {
        db[resType][index] = { ...db[resType][index], ...req.body };
        writeDB(db);
        return res.json(db[resType][index]);
      }
    }
    res.status(404).json({ message: 'მონაცემი ვერ მოიძებნა' });
  });
});

const server = app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error(`[CRITICAL SERVER ERROR]:`, err);
  process.exit(1);
});

setInterval(() => {
  console.log(`[ALIVE] Server heart beating at ${new Date().toLocaleTimeString()} on Port ${PORT}`);
}, 5000);

process.on('uncaughtException', (err) => {
  console.error(`[UNCAUGHT EXCEPTION]:`, err);
  console.error(err.stack);
});
