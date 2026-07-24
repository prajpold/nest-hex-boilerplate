import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

import { LoginCommand } from "@modules/auth/application/commands/login/login.command";

import { LoginRequestDto } from "./dto/login.request.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("login")
  async login(@Body() dto: LoginRequestDto) {
    const tokens = await this.commandBus.execute(new LoginCommand(dto.email, dto.password));
    return { data: tokens };
  }
}
