// tests/usuario.spec.js
import { test, expect } from '@playwright/test';
import { UsuarioApi } from '../src/api/UsuarioApi.js'; 
import { UsuarioFactory } from '../src/factories/UsuarioFactory.js';

test.describe('Testes de API - Usuários', () => {
  let usuarioApi;

  test.beforeAll(async () => {
        // Agora injetamos o BASE_URL explicitamente no contexto manual
        apiContext = await playwrightRequest.newContext({
            baseURL: process.env.BASE_URL
        });
        
        usuarioApi = new UsuarioApi(apiContext);
  });

  test('Deve criar um usuário com sucesso', async () => {
    const bodyUsuario = UsuarioFactory.gerarUsuarioValido('true');

    const response = await usuarioApi.criarUsuario(bodyUsuario);

    expect(response.status()).toBe(201);
  });
});