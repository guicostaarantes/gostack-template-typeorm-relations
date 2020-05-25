import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    if (price < 0) {
      throw new AppError('Price cannot have a negative value.', 400);
    }

    if (quantity < 0) {
      throw new AppError('Quantity cannot have a negative value.', 400);
    }

    const nameClash = await this.productsRepository.findByName(name);

    if (nameClash) {
      throw new AppError('Product with same name already exists.', 400);
    }

    const product = await this.productsRepository.create({
      name,
      price,
      quantity,
    });

    return product;
  }
}

export default CreateProductService;
