export class ProdutoApi {
    constructor(request) {
        this.request = request;
    }

    async listarProdutos() {
        return await this.request.get('/produtos');
    }

    async buscarProdutoPorId(id) {
        return await this.request.get(`/produtos/${id}`);
    }

    async criarProduto(body, token) {
        return await this.request.post('/produtos', {
            data: body,
            headers: {
                Authorization: token
            }
        });
    }

    async deletarProduto(id, token) {
        return await this.request.delete(`/produtos/${id}`, {
            headers: {
                Authorization: token
            }
        });
    }
}