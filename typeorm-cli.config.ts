import { Coffee } from "src/coffees/entities/coffee.entity";
import { Flavor } from "src/coffees/entities/flavor.entity";
import { CoffeeRefactor1698610486668 } from "src/migrations/1698610486668-CoffeeRefactor";
import { SchemaSync1698611067895 } from "src/migrations/1698611067895-SchemaSync";
import { DataSource } from "typeorm";

export default new DataSource({
    type: 'postgres',
    host: 'pg_container_nestjs_fundamentals',
    port: 5432,
    username: 'postgres',
    password: '123',
    database: 'nest',
    entities: [Coffee, Flavor],
    migrations: [
      CoffeeRefactor1698610486668,
      SchemaSync1698611067895
    ],
  });
  