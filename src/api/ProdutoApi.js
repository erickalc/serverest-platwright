// src/api/ProdutoApi.js
export class ProdutoApi {
    constructor(request) {
        this.request = request;
    }

    async listarProdutos(params = {}) {
        return await this.request.get('/produtos', {
            params: params
        });
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

    async editarProduto(id, body, token) {
        return await this.request.put(`/produtos/${id}`, {
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