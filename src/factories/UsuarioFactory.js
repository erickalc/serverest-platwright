// src/factories/UsuarioFactory.js
import { fakerPT_BR as faker } from '@faker-js/faker';

export class UsuarioFactory {

  static gerarUsuarioValido(admin = 'true') {
    
    const primeiroNome = faker.person.firstName();
    const sobrenome = faker.person.lastName();
    const emailSanitizado = `${primeiroNome}.${sobrenome}${faker.number.int({ min: 10, max: 9999 })}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();

    return {
      nome: `${primeiroNome} ${sobrenome}`,
      email: `${emailSanitizado}@example.com`,
      password: `${sobrenome.toLowerCase()}$123`.replace(/\s+/g, ''),
      administrador: String(admin),
    };
  }
}