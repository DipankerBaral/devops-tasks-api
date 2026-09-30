import { test, expect } from '@playwright/test';

test.describe('Health check', () => {
  test('GET /health returns ok with uptime', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(typeof body.uptime).toBe('number');
  });
});
