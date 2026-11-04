// tests/usuario.spec.js
import { test, expect } from '@playwright/test';
import { UsuarioApi } from '../src/api/UsuarioApi.js'; // Mesmo nome: UsuarioApi
import { UsuarioFactory } from '../src/factories/UsuarioFactory.js';

test.describe('Testes de API - Usuários', () => {
  let usuarioApi;

  test.beforeEach(async ({ request }) => {
    usuarioApi = new UsuarioApi(request);
  });

  test('Deve criar um usuário com sucesso', async () => {
    const bodyUsuario = UsuarioFactory.gerarUsuarioValido('true');

    const response = await usuarioApi.criarUsuario(bodyUsuario);

    expect(response.status()).toBe(201);
  });
});