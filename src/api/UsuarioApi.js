// src/api/UsuarioApi.js
export class UsuarioApi {
  constructor(request) {
    this.request = request;
    this.endpoint = '/usuarios';
  }

  async criarUsuario(payload) {
    return this.request.post(this.endpoint, {
      data: payload,
    });
  }
}