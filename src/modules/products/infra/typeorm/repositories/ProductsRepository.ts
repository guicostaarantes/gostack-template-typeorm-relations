import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const newProduct = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    const product = await this.ormRepository.save(newProduct);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ name });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.find({
      id: In(products.map(product => product.id)),
    });

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatePromises = products.map(async updatingProduct => {
      const product = await this.ormRepository.findOne({
        id: updatingProduct.id,
      });
      if (!product) {
        throw new AppError('Product not found.', 400);
      }
      product.quantity -= updatingProduct.quantity;
      return this.ormRepository.save(product);
    });

    const updatedProducts = await Promise.all(updatePromises);

    return updatedProducts;
  }
}

export default ProductsRepository;
