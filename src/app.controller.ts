import { Controller, Get } from "@nestjs/common";

import { ping } from "@shared/kernel/ping";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log(ping());
    return this.appService.getHello();
  }
}
