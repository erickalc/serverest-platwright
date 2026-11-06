export class UsuarioApi {
    constructor(request) {
        this.request = request;
    }

    async criarUsuario(payload) {
        // Passando a rota '/usuarios' diretamente, igual fizemos em produtos e carrinhos
        return await this.request.post('/usuarios', {
            data: payload,
        });
    }

    async buscarUsuarioPorId(id) {
        return await this.request.get(`/usuarios/${id}`);
    }

    async deletarUsuario(id) {
        return await this.request.delete(`/usuarios/${id}`);
    }
}