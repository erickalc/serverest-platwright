// playwright.config.js
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Carrega o arquivo .env a partir da raiz do projeto para execuções locais
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
    }]
  ],

  use: {
    // Definimos um valor padrão diretamente para garantir que a esteira o tenha, 
    // enquanto o ambiente local pode continuar a usar a variável do .env, caso exista.
    baseURL: process.env.BASE_URL || 'https://serverest.dev',

    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    trace: 'retain-on-failure',
  },
});