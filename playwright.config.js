// playwright.config.js
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Carrega o arquivo .env a partir da raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Trava de segurança: impede o teste de rodar sem apontar para um ambiente explícito
if (!process.env.BASE_URL) {
  throw new Error(
    '❌ ERRO CRÍTICO DE CONFIGURAÇÃO:\n' +
    'A variável BASE_URL não foi definida.\n' +
    'Crie um arquivo .env na raiz com BASE_URL=https://serverest.dev ou injete-a via GitLab CI Variables.'
  );
}

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'junit-results.xml' }]
  ],

  use: {
    // Lê estritamente a variável de ambiente sem expor nenhuma URL fixa
    baseURL: process.env.BASE_URL,

    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(process.env.API_TOKEN && {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      }),
    },
    trace: 'retain-on-failure',
  },
});