import { test, expect, APIRequestContext } from '@playwright/test';

// Each test creates its own data, so tests never depend on each other
// and can safely run in parallel or against a shared environment.
async function createTask(request: APIRequestContext, title: string) {
  const response = await request.post('/tasks', { data: { title } });
  expect(response.status()).toBe(201);
  return response.json();
}

test.describe('Tasks API', () => {
  test('POST /tasks creates a task', async ({ request }) => {
    const task = await createTask(request, 'Learn Docker');

    expect(task.id).toBeTruthy();
    expect(task.title).toBe('Learn Docker');
    expect(task.done).toBe(false);
    expect(Date.parse(task.createdAt)).not.toBeNaN();
  });

  test('POST /tasks trims whitespace from the title', async ({ request }) => {
    const task = await createTask(request, '   Learn Terraform   ');
    expect(task.title).toBe('Learn Terraform');
  });

  test('POST /tasks rejects a missing title', async ({ request }) => {
    const response = await request.post('/tasks', { data: {} });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain('title');
  });

  test('POST /tasks rejects an empty title', async ({ request }) => {
    const response = await request.post('/tasks', { data: { title: '   ' } });
    expect(response.status()).toBe(400);
  });

  test('GET /tasks lists created tasks', async ({ request }) => {
    const task = await createTask(request, 'Learn Kubernetes');

    const response = await request.get('/tasks');
    expect(response.status()).toBe(200);

    const tasks = await response.json();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks).toContainEqual(task);
  });

  test('GET /tasks/:id returns a single task', async ({ request }) => {
    const task = await createTask(request, 'Learn AWS');

    const response = await request.get(`/tasks/${task.id}`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(task);
  });

  test('GET /tasks/:id returns 404 for an unknown id', async ({ request }) => {
    const response = await request.get('/tasks/does-not-exist');
    expect(response.status()).toBe(404);
  });

  test('PATCH /tasks/:id marks a task as done', async ({ request }) => {
    const task = await createTask(request, 'Write tests');

    const response = await request.patch(`/tasks/${task.id}`, { data: { done: true } });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.done).toBe(true);
    expect(updated.title).toBe('Write tests');
  });

  test('PATCH /tasks/:id rejects a non-boolean done value', async ({ request }) => {
    const task = await createTask(request, 'Validate input');

    const response = await request.patch(`/tasks/${task.id}`, { data: { done: 'yes' } });
    expect(response.status()).toBe(400);
  });

  test('PATCH /tasks/:id rejects an empty title', async ({ request }) => {
    // Arrange: create a task to update
    const task = await createTask(request, 'Original title');

    // Act: try to set an empty (whitespace-only) title
    const response = await request.patch(`/tasks/${task.id}`, { data: { title: '   ' } });

    // Assert: the request is rejected with a helpful error
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain('title');

    // Assert: the task was not changed
    const getResponse = await request.get(`/tasks/${task.id}`);
    expect((await getResponse.json()).title).toBe('Original title');
  });
  
  test('DELETE /tasks/:id removes a task', async ({ request }) => {
    const task = await createTask(request, 'Temporary task');

    const deleteResponse = await request.delete(`/tasks/${task.id}`);
    expect(deleteResponse.status()).toBe(204);

    const getResponse = await request.get(`/tasks/${task.id}`);
    expect(getResponse.status()).toBe(404);
  });

  test('DELETE /tasks/:id returns 404 for an unknown id', async ({ request }) => {
    const response = await request.delete('/tasks/does-not-exist');
    expect(response.status()).toBe(404);
  });
});
