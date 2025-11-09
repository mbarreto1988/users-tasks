import request from 'supertest';
import express from 'express';

import { Server } from '..';

describe('Server integration', () => {
  let app: express.Application;

  beforeAll(() => {
    const server = new Server();
    app = server['app'];
  });

  it('should respond to the root route', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Helloo');
  });
});
