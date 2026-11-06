import { test, expect } from '@playwright/test';

import { CarrinhoApi } from '../src/api/CarrinhoApi.js';
import { CarrinhoFactory } from '../src/factories/CarrinhoFactory.js';
import { ProdutoApi } from '../src/api/ProdutoApi.js';
import { ProdutoFactory } from '../src/factories/ProdutoFactory.js';
import { UsuarioApi } from '../src/api/UsuarioApi.js'; 
import { LoginApi } from '../src/api/LoginApi.js';     
import { UsuarioFactory } from '../src/factories/UsuarioFactory.js'; 

test.describe('Testes de API - Carrinhos', () => {
    let carrinhoApi;
    let produtoApi;
    
    let tokenAdmin;
    let idProdutoCadastrado;
    let idUsuarioCadastrado;

    // Função auxiliar para verificar o estoque do produto (equivalente ao seu verificaAtualizacaoEstoque no Java)
    async function verificaAtualizacaoEstoque(idProduto, estoqueEsperado) {
        const response = await produtoApi.buscarProdutoPorId(idProduto);
        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(body.quantidade).toBe(estoqueEsperado);
    }

    test.beforeEach(async ({ request }) => {
        carrinhoApi = new CarrinhoApi(request);
        produtoApi = new ProdutoApi(request);
        const usuarioApi = new UsuarioApi(request);
        const loginApi = new LoginApi(request);
        
        // 1. Cadastra Usuário Admin
        const usuarioAdmin = UsuarioFactory.gerarUsuarioValido(); 
        usuarioAdmin.administrador = 'true'; 
        const responseUser = await usuarioApi.criarUsuario(usuarioAdmin);
        idUsuarioCadastrado = (await responseUser.json())._id;
        
        // 2. Realiza Login
        const responseLogin = await loginApi.realizarLogin(
            usuarioAdmin.email, 
            usuarioAdmin.password
        );
        tokenAdmin = (await responseLogin.json()).authorization;
        
        // 3. Cadastra Produto
        const bodyProduto = ProdutoFactory.gerarProdutoValido();
        const responseProduto = await produtoApi.criarProduto(bodyProduto, tokenAdmin);
        idProdutoCadastrado = (await responseProduto.json())._id;
    });

    test('Deve realizar o fluxo principal de compra com sucesso e verificar a sensibilização do estoque', async () => {
        // Busca estoque inicial
        const responseProduto = await produtoApi.buscarProdutoPorId(idProdutoCadastrado);
        const estoqueInicial = (await responseProduto.json()).quantidade;

        // Cadastra Carrinho
        const qtdCompra = 1;
        const bodyCarrinho = CarrinhoFactory.gerarCarrinhoValido(idProdutoCadastrado, qtdCompra);
        const responseCarrinho = await carrinhoApi.cadastrarCarrinho(bodyCarrinho, tokenAdmin);
        
        expect(responseCarrinho.status()).toBe(201);
        const bodyResponseCarrinho = await responseCarrinho.json();
        expect(bodyResponseCarrinho.message).toBe('Cadastro realizado com sucesso');
        const idCarrinho = bodyResponseCarrinho._id;

        // Verifica baixa do estoque ao adicionar ao carrinho
        await verificaAtualizacaoEstoque(idProdutoCadastrado, estoqueInicial - qtdCompra);

        // Busca informações do carrinho para verificar se foi adicionado corretamente
        const responseBusca = await carrinhoApi.buscarCarrinhoPorId(idCarrinho);
        expect(responseBusca.status()).toBe(200);
        const bodyBusca = await responseBusca.json();
        expect(bodyBusca._id).toBe(idCarrinho);
        expect(bodyBusca.produtos[0].idProduto).toBe(idProdutoCadastrado);
        expect(bodyBusca.produtos[0].quantidade).toBe(qtdCompra);

        // Conclui a compra
        const responseConcluir = await carrinhoApi.concluirCompra(tokenAdmin);
        expect(responseConcluir.status()).toBe(200);
        expect((await responseConcluir.json()).message).toBe('Registro excluído com sucesso');

        // Verifica que o carrinho não existe mais
        const responseBuscaPosCompra = await carrinhoApi.buscarCarrinhoPorId(idCarrinho);
        expect(responseBuscaPosCompra.status()).toBe(400);
        expect((await responseBuscaPosCompra.json()).message).toBe('Carrinho não encontrado');

        // Verifica se o estoque permanece com a baixa consolidada
        await verificaAtualizacaoEstoque(idProdutoCadastrado, estoqueInicial - qtdCompra);
    });

    test('Deve realizar o fluxo principal de compra e verificar a listagem de produtos por filtro', async () => {
        const qtdCompra = 1;
        const bodyCarrinho = CarrinhoFactory.gerarCarrinhoValido(idProdutoCadastrado, qtdCompra);
        const responseCarrinho = await carrinhoApi.cadastrarCarrinho(bodyCarrinho, tokenAdmin);
        const idCarrinho = (await responseCarrinho.json())._id;

        // Busca por Query Param informando o ID do carrinho
        const responseFiltroId = await carrinhoApi.buscarCarrinhosPorFiltro({ _id: idCarrinho });
        expect(responseFiltroId.status()).toBe(200);
        const bodyFiltroId = await responseFiltroId.json();
        expect(bodyFiltroId.carrinhos[0]._id).toBe(idCarrinho);
        expect(bodyFiltroId.carrinhos[0].produtos[0].idProduto).toBe(idProdutoCadastrado);
        expect(bodyFiltroId.carrinhos[0].produtos[0].quantidade).toBe(qtdCompra);

        // Busca por Query Param informando o ID do usuário
        const responseFiltroUser = await carrinhoApi.buscarCarrinhosPorFiltro({ idUsuario: idUsuarioCadastrado });
        expect(responseFiltroUser.status()).toBe(200);
        const bodyFiltroUser = await responseFiltroUser.json();
        expect(bodyFiltroUser.carrinhos[0].idUsuario).toBe(idUsuarioCadastrado);
        expect(bodyFiltroUser.carrinhos[0].produtos[0].idProduto).toBe(idProdutoCadastrado);
        expect(bodyFiltroUser.carrinhos[0].produtos[0].quantidade).toBe(qtdCompra);
    });

    test('Deve realizar o fluxo principal de compra e verificar que o estoque foi reabastecido após cancelamento', async () => {
        const responseProduto = await produtoApi.buscarProdutoPorId(idProdutoCadastrado);
        const estoqueInicial = (await responseProduto.json()).quantidade;

        const qtdCompra = 1;
        const bodyCarrinho = CarrinhoFactory.gerarCarrinhoValido(idProdutoCadastrado, qtdCompra);
        const responseCarrinho = await carrinhoApi.cadastrarCarrinho(bodyCarrinho, tokenAdmin);
        const idCarrinho = (await responseCarrinho.json())._id;

        // Verifica baixa do estoque
        await verificaAtualizacaoEstoque(idProdutoCadastrado, estoqueInicial - qtdCompra);

        // Cancela a Compra
        const responseCancelar = await carrinhoApi.cancelarCompra(tokenAdmin);
        expect(responseCancelar.status()).toBe(200);
        expect((await responseCancelar.json()).message).toBe('Registro excluído com sucesso. Estoque dos produtos reabastecido');

        // Verifica reabastecimento do estoque
        await verificaAtualizacaoEstoque(idProdutoCadastrado, estoqueInicial);
    });

    test('Não deve permitir ao usuário adicionar mais de um carrinho', async () => {
        const bodyCarrinho = CarrinhoFactory.gerarCarrinhoValido(idProdutoCadastrado, 1);
        
        // Primeiro carrinho
        await carrinhoApi.cadastrarCarrinho(bodyCarrinho, tokenAdmin);

        // Segundo carrinho - Deve falhar
        const responseSegundoCarrinho = await carrinhoApi.cadastrarCarrinho(bodyCarrinho, tokenAdmin);
        expect(responseSegundoCarrinho.status()).toBe(400);
        expect((await responseSegundoCarrinho.json()).message).toBe('Não é permitido ter mais de 1 carrinho');
    });

    test('Não deve permitir comprar quantidade de produtos maior que a quantidade em estoque', async () => {
        const responseProduto = await produtoApi.buscarProdutoPorId(idProdutoCadastrado);
        const estoqueInicial = (await responseProduto.json()).quantidade;

        const qtdInvalida = estoqueInicial + 1;
        const bodyCarrinho = CarrinhoFactory.gerarCarrinhoValido(idProdutoCadastrado, qtdInvalida);
        
        const responseCarrinho = await carrinhoApi.cadastrarCarrinho(bodyCarrinho, tokenAdmin);
        expect(responseCarrinho.status()).toBe(400);
        
        const bodyResponse = await responseCarrinho.json();
        expect(bodyResponse.message).toBe('Produto não possui quantidade suficiente');
        expect(bodyResponse.item.idProduto).toBe(idProdutoCadastrado);
        expect(bodyResponse.item.quantidade).toBe(qtdInvalida);
        expect(bodyResponse.item.quantidadeEstoque).toBe(estoqueInicial);

        // Verifica que o estoque não sofreu alteração
        await verificaAtualizacaoEstoque(idProdutoCadastrado, estoqueInicial);
    });
});