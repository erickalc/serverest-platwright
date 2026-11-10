// tests/carrinhos.spec.js
import { test, expect } from '@playwright/test';
import { CarrinhoApi } from '../src/api/CarrinhoApi.js';
import { ProdutoApi } from '../src/api/ProdutoApi.js';
import { UsuarioApi } from '../src/api/UsuarioApi.js';
import { LoginApi } from '../src/api/LoginApi.js';
import { UsuarioFactory } from '../src/factories/UsuarioFactory.js';
import { ProdutoFactory } from '../src/factories/ProdutoFactory.js';

test.describe('Testes de API - Carrinhos', () => {
    let carrinhoApi;
    let produtoApi;
    let usuarioApi;
    let loginApi;
    let token;
    let idProduto;
    let produtoCriado;

    test.beforeEach(async ({ request }) => {
        usuarioApi = new UsuarioApi(request);
        loginApi = new LoginApi(request);
        produtoApi = new ProdutoApi(request);
        carrinhoApi = new CarrinhoApi(request);

        // 1. Cria usuário administrador
        const usuario = UsuarioFactory.gerarUsuarioValido('true');
        const resUsuario = await usuarioApi.criarUsuario(usuario);
        expect(resUsuario.status(), 'Falha ao criar usuário no beforeEach').toBe(201);

        // 2. Realiza login e extrai o token
        const resLogin = await loginApi.realizarLogin(usuario.email, usuario.password);
        expect(resLogin.status(), 'Falha ao realizar login no beforeEach').toBe(200);
        const bodyLogin = await resLogin.json();
        token = bodyLogin.authorization;

        // 3. Cria um produto novo para os testes de carrinho
        produtoCriado = ProdutoFactory.gerarProdutoValido();
        const resProduto = await produtoApi.criarProduto(produtoCriado, token);
        expect(resProduto.status(), 'Falha ao criar produto no beforeEach').toBe(201);
        const bodyProduto = await resProduto.json();
        idProduto = bodyProduto._id;
    });

    test('Deve realizar o fluxo principal de compra com sucesso e verificar a sensibilização do estoque', async () => {
        const quantidadeComprada = 1;
        const payloadCarrinho = {
            produtos: [
                {
                    idProduto: idProduto,
                    quantidade: quantidadeComprada,
                },
            ],
        };

        const resCriarCarrinho = await carrinhoApi.cadastrarCarrinho(payloadCarrinho, token);
        expect(resCriarCarrinho.status()).toBe(201);

        // Verifica na listagem de produtos se o estoque foi reduzido
        const resListaProdutos = await produtoApi.listarProdutos();
        const bodyLista = await resListaProdutos.json();
        const produtoAtualizado = bodyLista.produtos.find((p) => p._id === idProduto);
        expect(produtoAtualizado.quantidade).toBe(produtoCriado.quantidade - quantidadeComprada);

        // Conclui a compra
        const resConcluir = await carrinhoApi.concluirCompra(token);
        expect(resConcluir.status()).toBe(200);
        const bodyConcluir = await resConcluir.json();
        expect(bodyConcluir.message).toBe('Registro excluído com sucesso');
    });

    test('Deve realizar o fluxo principal de compra e verificar a listagem de produtos por filtro', async () => {
        const payloadCarrinho = {
            produtos: [
                {
                    idProduto: idProduto,
                    quantidade: 1,
                },
            ],
        };

        const resCriarCarrinho = await carrinhoApi.cadastrarCarrinho(payloadCarrinho, token);
        expect(resCriarCarrinho.status()).toBe(201);
        const bodyCarrinho = await resCriarCarrinho.json();

        // Verifica o carrinho criado usando o filtro da CarrinhoApi
        const resBuscaFiltro = await carrinhoApi.buscarCarrinhosPorFiltro({ _id: bodyCarrinho._id });
        expect(resBuscaFiltro.status()).toBe(200);
        const bodyFiltro = await resBuscaFiltro.json();
        expect(bodyFiltro.quantidade).toBe(1);

        // Conclui a compra
        const resConcluir = await carrinhoApi.concluirCompra(token);
        expect(resConcluir.status()).toBe(200);
    });

    test('Deve realizar o fluxo principal de compra e verificar que o estoque foi reabastecido após cancelamento', async () => {
        const quantidadeComprada = 1;
        const payloadCarrinho = {
            produtos: [
                {
                    idProduto: idProduto,
                    quantidade: quantidadeComprada,
                },
            ],
        };

        const resCriarCarrinho = await carrinhoApi.cadastrarCarrinho(payloadCarrinho, token);
        expect(resCriarCarrinho.status()).toBe(201);

        // Cancela a compra e verifica se os produtos retornaram ao estoque
        const resCancelar = await carrinhoApi.cancelarCompra(token);
        expect(resCancelar.status()).toBe(200);
        const bodyCancelar = await resCancelar.json();
        expect(bodyCancelar.message).toBe('Registro excluído com sucesso. Estoque dos produtos reabastecido');

        const resListaProdutos = await produtoApi.listarProdutos();
        const bodyLista = await resListaProdutos.json();
        const produtoReabastecido = bodyLista.produtos.find((p) => p._id === idProduto);
        expect(produtoReabastecido.quantidade).toBe(produtoCriado.quantidade);
    });

    test('Não deve permitir ao usuário adicionar mais de um carrinho', async () => {
        const payloadCarrinho = {
            produtos: [
                {
                    idProduto: idProduto,
                    quantidade: 1,
                },
            ],
        };

        const resPrimeiroCarrinho = await carrinhoApi.cadastrarCarrinho(payloadCarrinho, token);
        expect(resPrimeiroCarrinho.status()).toBe(201);

        const resSegundoCarrinho = await carrinhoApi.cadastrarCarrinho(payloadCarrinho, token);
        expect(resSegundoCarrinho.status()).toBe(400);
        const bodyErro = await resSegundoCarrinho.json();
        expect(bodyErro.message).toBe('Não é permitido ter mais de 1 carrinho');
    });

    test('Não deve permitir comprar quantidade de produtos maior que a quantidade em estoque', async () => {
        const payloadCarrinho = {
            produtos: [
                {
                    idProduto: idProduto,
                    quantidade: produtoCriado.quantidade + 10,
                },
            ],
        };

        const resCarrinho = await carrinhoApi.cadastrarCarrinho(payloadCarrinho, token);
        expect(resCarrinho.status()).toBe(400);
        const bodyErro = await resCarrinho.json();
        expect(bodyErro.message).toBe('Produto não possui quantidade suficiente');
    });
});