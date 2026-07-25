import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { setupSwagger } from "./shared/infrastructure/http/swagger.setup";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>("app.port");
  const isProduction = config.get<string>("app.env") === "production";

  setupSwagger(app, isProduction);

  await app.listen(port ?? 3000);
}

void bootstrap();
