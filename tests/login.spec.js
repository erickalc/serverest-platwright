// tests/login.spec.js
import { test, expect } from '@playwright/test';
import { LoginApi } from '../src/api/LoginApi.js';
import { UsuarioApi } from '../src/api/UsuarioApi.js';
import { UsuarioFactory } from '../src/factories/UsuarioFactory.js';

test.describe('Testes da Funcionalidade Login', () => {
    let loginApi;
    let usuarioApi;
    let usuarioMassa;

    test.beforeEach(async ({ request }) => {
        loginApi = new LoginApi(request);
        usuarioApi = new UsuarioApi(request);

        usuarioMassa = UsuarioFactory.gerarUsuarioValido('true');
        const responseSetup = await usuarioApi.criarUsuario(usuarioMassa);
        expect(responseSetup.status()).toBe(201);
    });

    test('Deve realizar login com sucesso', async () => {
        const response = await loginApi.realizarLogin(
            usuarioMassa.email,
            usuarioMassa.password
        );
        const body = await response.json();

        expect(response.status()).toBe(200);
        expect(body.message).toBe('Login realizado com sucesso');

        expect(body).toHaveProperty('authorization');
        expect(typeof body.authorization).toBe('string');
        expect(body.authorization.startsWith('Bearer ')).toBeTruthy();
    });
});