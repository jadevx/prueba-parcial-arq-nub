require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'tasks.db');

// Inicializar BD
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','done')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Listar tareas
app.get('/api/tasks', (req, res) => {
  const { status, priority } = req.query;
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (priority) { sql += ' AND priority = ?'; params.push(priority); }
  sql += ' ORDER BY created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// Obtener tarea por ID
app.get('/api/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

// Crear tarea
app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'El título es obligatorio' });
  const result = db.prepare(
    'INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)'
  ).run(title, description || null, priority || 'medium');
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
});

// Actualizar tarea
app.put('/api/tasks/:id', (req, res) => {
  const { title, description, status, priority } = req.body;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tarea no encontrada' });
  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, priority=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).run(title || existing.title, description !== undefined ? description : existing.description, status || existing.status, priority || existing.priority, req.params.id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

// Eliminar tarea
app.delete('/api/tasks/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ message: 'Tarea eliminada' });
});

// Estadísticas
app.get('/api/stats', (req, res) => {
  const stats = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all();
  const total = db.prepare('SELECT COUNT(*) as total FROM tasks').get();
  res.json({ total: total.total, by_status: stats });
});

app.listen(PORT, () => console.log(`Task API en http://localhost:${PORT}`));
