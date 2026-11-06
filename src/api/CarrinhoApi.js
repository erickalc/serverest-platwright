export class CarrinhoApi {
    constructor(request) {
        this.request = request;
    }

    async cadastrarCarrinho(body, token) {
        return await this.request.post('/carrinhos', {
            data: body,
            headers: {
                Authorization: token
            }
        });
    }

    async buscarCarrinhoPorId(id) {
        return await this.request.get(`/carrinhos/${id}`);
    }

    async buscarCarrinhosPorFiltro(params) {
        return await this.request.get('/carrinhos', {
            params: params
        });
    }

    async concluirCompra(token) {
        return await this.request.delete('/carrinhos/concluir-compra', {
            headers: {
                Authorization: token
            }
        });
    }

    async cancelarCompra(token) {
        return await this.request.delete('/carrinhos/cancelar-compra', {
            headers: {
                Authorization: token
            }
        });
    }
}