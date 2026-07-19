import { ConfigService } from "@nestjs/config";
import { DataSourceOptions } from "typeorm";

export const buildTypeOrmOptions = (configService: ConfigService): DataSourceOptions => ({
  type: "postgres",
  host: configService.get<string>("database.host"),
  port: configService.get<number>("database.port"),
  username: configService.get<string>("database.username"),
  password: configService.get<string>("database.password"),
  database: configService.get<string>("database.name"),
  entities: [__dirname + "/../../../modules/**/*.orm-entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
  logging: configService.get<string>("app.env") === "development",
});
