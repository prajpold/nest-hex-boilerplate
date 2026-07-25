import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication, isProduction: boolean): void {
  if (isProduction) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle("Nest Hex Boilerplate API")
    .setDescription("Hexagonal architecture + CQRS NestJS boilerplate")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
}
