export class CarrinhoFactory {
    static gerarCarrinhoValido(idProduto, quantidade) {
        return {
            produtos: [
                {
                    idProduto: idProduto,
                    quantidade: quantidade
                }
            ]
        };
    }
}