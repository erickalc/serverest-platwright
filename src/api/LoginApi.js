export class LoginApi {
  constructor(request) {
    this.request = request;
    this.endpoint = '/login';
  }

  async realizarLogin(email, password) {
    return this.request.post(this.endpoint, {
      data: {
        email: email,
        password: password
      }
    });
  }
}