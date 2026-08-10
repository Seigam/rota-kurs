import { describe, expect, it } from 'vitest';
import { AI_EVAL_CASES, adversarialCases, normalCases, sensitiveCases } from './evals/ai-eval-cases';

describe('Türkçe pilot eval seti', () => {
  it('48 normal, 12 kötüye kullanım ve 12 hassas vaka içerir', () => {
    expect(normalCases).toHaveLength(48);
    expect(adversarialCases).toHaveLength(12);
    expect(sensitiveCases).toHaveLength(12);
    expect(AI_EVAL_CASES).toHaveLength(72);
    expect(new Set(AI_EVAL_CASES.map((item) => item.id)).size).toBe(72);
  });
});
