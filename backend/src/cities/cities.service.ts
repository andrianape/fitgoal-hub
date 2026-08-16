import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  findAll(): Promise<City[]> {
    return this.cityRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepository.findOneBy({ id });

    if (!city) {
      throw new NotFoundException(
        `Grad sa ID vrednošću ${id} ne postoji.`,
      );
    }

    return city;
  }

  async create(createCityDto: CreateCityDto): Promise<City> {
    const normalizedName = createCityDto.name.trim();

    const existingCity = await this.cityRepository.findOneBy({
      name: normalizedName,
    });

    if (existingCity) {
      throw new ConflictException(
        `Grad "${normalizedName}" već postoji.`,
      );
    }

    const city = this.cityRepository.create({
      name: normalizedName,
      postalCode: createCityDto.postalCode?.trim() ?? null,
    });

    return this.cityRepository.save(city);
  }

  async update(
    id: number,
    updateCityDto: UpdateCityDto,
  ): Promise<City> {
    const city = await this.findOne(id);

    if (updateCityDto.name !== undefined) {
      const normalizedName = updateCityDto.name.trim();

      const cityWithSameName = await this.cityRepository.findOneBy({
        name: normalizedName,
      });

      if (cityWithSameName && cityWithSameName.id !== id) {
        throw new ConflictException(
          `Grad "${normalizedName}" već postoji.`,
        );
      }

      city.name = normalizedName;
    }

    if (updateCityDto.postalCode !== undefined) {
      city.postalCode = updateCityDto.postalCode.trim();
    }

    return this.cityRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    const city = await this.findOne(id);

    await this.cityRepository.remove(city);
  }
}