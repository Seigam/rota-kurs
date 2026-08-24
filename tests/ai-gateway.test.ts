import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ prisma: { aiGeneration: { create: vi.fn().mockResolvedValue({}) } } }));

import { suggestGoalsOutputSchema } from '@/lib/ai/contracts';
import { safeGoalTemplate } from '@/lib/ai/fallbacks';
import { AiGatewayError, AI_TASKS, runAiTask } from '@/lib/ai/gateway';
import { LifeDomain } from '@prisma/client';

describe('AI geçidi retry ve şema davranışı', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.AI_API_URL = 'https://ai.example.test/v1/chat/completions';
    process.env.AI_MODEL = 'qwen/qwen3.5-9b';
    process.env.AI_API_KEY = 'test-secret';
    process.env.AI_JSON_SCHEMA_ENABLED = 'true';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.AI_UPSTREAM_TIMEOUT_MS;
  });

  it('token gerektirmeyen servise Authorization başlığı olmadan istek gönderir', async () => {
    delete process.env.AI_API_KEY;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ goals: safeGoalTemplate(LifeDomain.CAREER, 'SHORT_TERM') }) } }],
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(runAiTask({ definition: AI_TASKS.suggestGoals(suggestGoalsOutputSchema), profileId: 'p1', input: {} }))
      .resolves.toMatchObject({ data: { goals: expect.any(Array) } });

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(requestInit.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(requestInit.headers).not.toHaveProperty('Authorization');
  });

  it('yalnız 503 taşıma hatasında bir kez tekrar dener', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(runAiTask({ definition: AI_TASKS.suggestGoals(suggestGoalsOutputSchema), profileId: 'p1', input: {} })).rejects.toBeInstanceOf(AiGatewayError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('400 yanıtında tekrar denemez', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('bad', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(runAiTask({ definition: AI_TASKS.suggestGoals(suggestGoalsOutputSchema), profileId: 'p1', input: {} })).rejects.toBeInstanceOf(AiGatewayError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bozuk JSON içeriğini regex ile kurtarmadan reddeder', async () => {
    const wrapped = `İşte sonuç: ${JSON.stringify({ goals: safeGoalTemplate(LifeDomain.CAREER, 'SHORT_TERM') })}`;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: wrapped } }] }), { status: 200 })));
    await expect(runAiTask({ definition: AI_TASKS.suggestGoals(suggestGoalsOutputSchema), profileId: 'p1', input: {} }))
      .rejects.toMatchObject({ reason: 'schema' });
  });

  it('yapılandırılan toplam upstream süresi dolunca isteği timeout olarak keser', async () => {
    vi.useFakeTimers();
    process.env.AI_UPSTREAM_TIMEOUT_MS = '30000';
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));

    const pending = runAiTask({ definition: AI_TASKS.suggestGoals(suggestGoalsOutputSchema), profileId: 'p1', input: {} });
    const assertion = expect(pending).rejects.toMatchObject({ reason: 'timeout' });
    await vi.advanceTimersByTimeAsync(30_000);
    await assertion;
  });

  it('route bütçesini aşan timeout yapılandırmasını reddeder', async () => {
    process.env.AI_UPSTREAM_TIMEOUT_MS = '240000';
    await expect(runAiTask({ definition: AI_TASKS.suggestGoals(suggestGoalsOutputSchema), profileId: 'p1', input: {} }))
      .rejects.toMatchObject({ reason: 'configuration' });
  });
});
