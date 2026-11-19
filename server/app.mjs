import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { TrainingStore } from './store.mjs';
import { actors } from './fixtures.mjs';
import { body, fail } from './validation.mjs';
import { list } from './queries.mjs';
import { find, present, create, patch, archive } from './domain.mjs';

export async function createServer(filename) {
  const store = new TrainingStore(filename);
  await store.open();
  const server = http.createServer(async (request, response) => {
    const requestId = randomUUID();
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, value) => {
      response.writeHead(status);
      response.end(JSON.stringify(value));
    };
    try {
      const url = new URL(request.url, 'http://127.0.0.1'),
        method = request.method;
      if (url.pathname === '/api/training/health' && method === 'GET')
        return send(200, {
          data: { status: 'ok', mode: 'local-training-only' },
        });
      const origin = request.headers.origin;
      if (
        origin &&
        !['http://127.0.0.1:4780', 'http://localhost:4780'].includes(origin)
      )
        fail(403, 'ORIGIN_FORBIDDEN', '训练服务只接受本地练习页面');
      // 公开模拟身份仅为固定练习，不是认证。禁止部署为真实业务登录方案。
      const actor = actors.find(
        (a) => a.id === request.headers['x-training-actor'],
      );
      if (!actor) fail(401, 'TRAINING_ACTOR_UNKNOWN', '请选择有效教学身份');
      if (url.pathname === '/api/training/v1/meta' && method === 'GET')
        return send(200, {
          data: {
            actors,
            titleMax: 60,
            descriptionMax: 1000,
            pageSizes: [5, 10, 20],
          },
        });
      if (
        method === 'GET' &&
        ['/api/training/v1/tickets', '/api/training/v2/overview'].includes(
          url.pathname,
        )
      )
        return send(
          200,
          list(
            store.read(),
            actor,
            url.searchParams,
            url.pathname.includes('/v2/'),
          ),
        );
      if (url.pathname === '/api/training/v1/tickets' && method === 'POST') {
        const input = await body(request);
        return send(201, {
          data: await store.update((d) => create(d, actor, input)),
        });
      }
      const match = url.pathname.match(
        /^\/api\/training\/v1\/tickets\/(TCK-\d+)(\/events)?$/,
      );
      if (!match) fail(404, 'ROUTE_NOT_FOUND', '接口不存在');
      const id = match[1];
      if (method === 'GET') {
        const data = store.read(),
          ticket = find(data, actor, id);
        return send(200, {
          data: match[2]
            ? data.events.filter((e) => e.ticketId === id)
            : present(ticket),
        });
      }
      if (!match[2] && method === 'PATCH') {
        const input = await body(request);
        return send(200, {
          data: await store.update((d) => patch(d, actor, id, input)),
        });
      }
      if (!match[2] && method === 'DELETE') {
        const input = await body(request);
        return send(200, {
          data: await store.update((d) => archive(d, actor, id, input)),
        });
      }
      fail(405, 'METHOD_NOT_ALLOWED', '此接口不支持该操作');
    } catch (error) {
      const status = error.status ?? 500;
      send(status, {
        error: {
          code: error.code ?? 'INTERNAL_ERROR',
          message:
            status >= 500 && status !== 501
              ? '训练服务发生错误'
              : error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
        requestId,
      });
    }
  });
  server.requestTimeout = 10000;
  return {
    server,
    store,
    listen: (port) =>
      new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', () => resolve(server.address()));
      }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
