const express = require('express');
const crypto = require('crypto');

// The app is created in a function (separate from server.js) so tests
// and different environments can start fresh instances of it.
function createApp() {
  const app = express();
  app.use(express.json());

  // In-memory storage for now. Later we can swap this for a real database (RDS).
  const tasks = new Map();

  // Health check: Docker, load balancers and ECS will all use this endpoint.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/tasks', (req, res) => {
    res.json([...tasks.values()]);
  });

  app.get('/tasks/:id', (req, res) => {
    const task = tasks.get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  app.post('/tasks', (req, res) => {
    const { title } = req.body || {};
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required and must be a non-empty string' });
    }
    const task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    tasks.set(task.id, task);
    res.status(201).json(task);
  });

  app.patch('/tasks/:id', (req, res) => {
    const task = tasks.get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title, done } = req.body || {};
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'title must be a non-empty string' });
      }
      task.title = title.trim();
    }
    if (done !== undefined) {
      if (typeof done !== 'boolean') {
        return res.status(400).json({ error: 'done must be a boolean' });
      }
      task.done = done;
    }
    res.json(task);
  });

  app.delete('/tasks/:id', (req, res) => {
    if (!tasks.delete(req.params.id)) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  });

  return app;
}

module.exports = { createApp };
