// tests/usuario.spec.js
import { test, expect, request } from '@playwright/test';
import { UsuarioApi } from '../src/api/UsuarioApi.js'; 
import { UsuarioFactory } from '../src/factories/UsuarioFactory.js';

test.describe('Testes de API - Usuários', () => {
    let apiContext;
    let usuarioApi;

    test.beforeAll(async () => {
        // Injetamos o BASE_URL explicitamente no contexto manual
        apiContext = await request.newContext({
            baseURL: process.env.BASE_URL
        });
        
        usuarioApi = new UsuarioApi(apiContext);
    });

    test.afterAll(async () => {
        // Limpa o contexto após a execução para não deixar processos pendentes
        if (apiContext) {
            await apiContext.dispose();
        }
    });

    test('Deve criar um usuário com sucesso', async () => {
        const bodyUsuario = UsuarioFactory.gerarUsuarioValido('true');

        const response = await usuarioApi.criarUsuario(bodyUsuario);

        expect(response.status()).toBe(201);
    });
});