import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

const createPath = (path: string) => `${__dirname}${path}`;

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    createPath("/../../../modules/**/*.orm-entity{.ts,.js}"),
    createPath("/base.orm-entity.ts"),
  ],
  migrations: [createPath("/migrations/*{.ts,.js}")],
  synchronize: false,
});
