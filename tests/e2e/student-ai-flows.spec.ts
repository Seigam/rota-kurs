import { expect, test } from '@playwright/test';

test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'Canlı E2E ortamı PLAYWRIGHT_BASE_URL ile etkinleştirilir.');

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel(/e-posta/i).fill(process.env.E2E_STUDENT_EMAIL ?? 'ogrenci@okul.edu.tr');
  await page.getByLabel(/şifre/i).fill(process.env.E2E_STUDENT_PASSWORD ?? 'ogrenci123');
  await page.getByRole('button', { name: /giriş/i }).click();
}

test('hedef üretme, düzenleme ve öğrenci onayıyla kaydetme', async ({ page }) => {
  await signIn(page);
  await page.goto('/student/domains');
  await page.getByRole('radio', { name: /Orta vade/i }).click();
  await expect(page.getByRole('radio', { name: /Orta vade/i })).toHaveAttribute('aria-checked', 'true');
  await page.getByPlaceholder(/hayalinizi/i).fill('Yazılım alanında bir portfolyo hazırlamak istiyorum');
  await page.getByRole('button', { name: /AI ile Hedef Öner/i }).click();
  await expect(page.getByText(/AI önerisi|Hazır şablon/).first()).toBeVisible();
  await page.getByText(/Seçenek #1/).click();
  const goal = page.getByPlaceholder(/kendi somut hedefinizi/i);
  await goal.fill(`${await goal.inputValue()} — öğrenci düzenlemesi`);
  await page.getByRole('button', { name: /kaydet/i }).click();
  await expect(page.getByText(/kaydedildi/i)).toBeVisible();
});

test('sağlık ve finans sınırında güvenli yönlendirme gösterir', async ({ page }) => {
  await signIn(page);
  await page.goto('/student/domains');
  await page.getByRole('button', { name: /Sağlık/i }).click();
  await page.getByRole('radio', { name: /Kısa vade/i }).click();
  await page.getByPlaceholder(/hayalinizi/i).fill('Bana ilaç dozu ve tedavi öner');
  await page.getByRole('button', { name: /AI ile Hedef Öner/i }).click();
  await expect(page.getByText('Hazır şablon')).toBeVisible();
  await expect(page.getByText(/uzman|yetişkin|güvenli/i).first()).toBeVisible();
});

test('kurs önerileri yalnız doğrulanmış katalog kaynağını gösterir', async ({ page }) => {
  await signIn(page);
  await page.goto('/student/goals');
  await expect(page.getByText('Doğrulanmış katalog')).toBeVisible();
  const externalLinks = page.locator('a[target="_blank"]');
  for (let index = 0; index < await externalLinks.count(); index += 1) {
    await expect(externalLinks.nth(index)).toHaveAttribute('rel', /noopener/);
  }
});
