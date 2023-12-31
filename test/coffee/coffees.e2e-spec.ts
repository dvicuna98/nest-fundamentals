import {HttpServer, HttpStatus, INestApplication, ValidationPipe} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {CreateCoffeeDto} from "../../src/coffees/dto/create-coffee.dto";
import * as request from 'supertest';
import {UpdateCoffeeDto} from "../../src/coffees/dto/update-coffee.dto";

describe('[Feature] Coffees - /coffees', () => {
    const coffee = {
        name: 'Shipwreck Roast',
        brand: 'Buddy Brew',
        flavors: ['chocolate', 'vanilla'],
    };
    const expectedPartialCoffee = expect.objectContaining({
        ...coffee,
        flavors: expect.arrayContaining(
            coffee.flavors.map(name => expect.objectContaining({ name })),
        ),
    });

    let app: INestApplication;
    let httpServer: HttpServer;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                CoffeesModule,
                TypeOrmModule.forRoot({ // can use a docker db for testing
                    type: 'postgres',
                    host: 'pg_container_nestjs_fundamentals',
                    port: 5432,
                    username: 'postgres',
                    password: '123',
                    database: 'nest', // use another database for test
                    autoLoadEntities: true,
                    synchronize: true,
                }),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
                transformOptions: {
                    enableImplicitConversion: true,
                },
            }),
        );

        await app.init();

        httpServer = app.getHttpServer();
    });

    it('Create [POST /]',async () => {
        const {body} = await request(httpServer)
            .post('/coffees')
            .send(coffee as CreateCoffeeDto)
            .expect(HttpStatus.CREATED);
        expect(body).toEqual(expectedPartialCoffee);
    });

    it('Get one [GET /:id]', () => {
        return request(httpServer)
            .get('/coffees/1')
            .then(({ body }) => {
                expect(body).toEqual(expectedPartialCoffee);
            });
    });

    it('Update one [PATCH /:id]', () => {
        const updateCoffeeDto: UpdateCoffeeDto = {
            ...coffee,
            name: 'New and Improved Shipwreck Roast'
        }
        return request(httpServer)
            .patch('/coffees/1')
            .send(updateCoffeeDto)
            .then(({ body }) => {
                expect(body.name).toEqual(updateCoffeeDto.name);

                return request(httpServer)
                    .get('/coffees/1')
                    .then(({ body }) => {
                        expect(body.name).toEqual(updateCoffeeDto.name);
                    });
            });
    });

    it('Delete one [DELETE /:id]', () => {
        return request(httpServer)
            .delete('/coffees/1')
            .expect(HttpStatus.OK)
            .then(() => {
                return request(httpServer)
                    .get('/coffees/1')
                    .expect(HttpStatus.NOT_FOUND);
            })
    });

    afterAll(async () => {
        await app.close();
    });
});