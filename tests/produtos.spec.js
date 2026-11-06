import { test, expect, request as playwrightRequest } from '@playwright/test';

import { ProdutoApi } from '../src/api/ProdutoApi.js';
import { ProdutoFactory } from '../src/factories/ProdutoFactory.js';
import { UsuarioApi } from '../src/api/UsuarioApi.js'; 
import { LoginApi } from '../src/api/LoginApi.js';     
import { UsuarioFactory } from '../src/factories/UsuarioFactory.js'; 

test.describe('Testes de API - Produtos', () => {
    let apiContext;
    let produtoApi;
    let tokenAdmin;

    test.beforeAll(async () => {
        apiContext = await playwrightRequest.newContext();
        
        produtoApi = new ProdutoApi(apiContext);
        const usuarioApi = new UsuarioApi(apiContext);
        const loginApi = new LoginApi(apiContext);
        
        const usuarioAdmin = UsuarioFactory.gerarUsuarioValido(); 
        usuarioAdmin.administrador = 'true'; 
        
        const responseCriacao = await usuarioApi.criarUsuario(usuarioAdmin);
        expect(responseCriacao.status(), 'Falha ao criar usuário admin no setup').toBe(201);
        
        const responseLogin = await loginApi.realizarLogin(
            usuarioAdmin.email,
            usuarioAdmin.password
        );
        expect(responseLogin.status(), 'Falha ao fazer login no setup').toBe(200);
        
        const bodyLogin = await responseLogin.json();
        tokenAdmin = bodyLogin.authorization;
        
        expect(tokenAdmin, 'Token não foi gerado').toBeDefined();
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test('Deve listar produtos com sucesso', async () => {
        const response = await produtoApi.listarProdutos();
        expect(response.status()).toBe(200);
    });

    test('Deve criar um produto com sucesso', async () => {
        const bodyProduto = ProdutoFactory.gerarProdutoValido();
        
        const response = await produtoApi.criarProduto(bodyProduto, tokenAdmin);
        const responseBody = await response.json();

        expect(response.status()).toBe(201);
        expect(responseBody.message).toBe('Cadastro realizado com sucesso');
    });
});