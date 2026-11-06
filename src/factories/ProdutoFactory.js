import { faker } from '@faker-js/faker';

export class ProdutoFactory {
    static gerarProdutoValido() {
        return {
            nome: `${faker.commerce.productName()} ${faker.string.uuid()}`,
            preco: faker.number.int({ min: 10, max: 5000 }),
            descricao: faker.commerce.productDescription(),
            quantidade: faker.number.int({ min: 1, max: 999 })
        };
    }
}