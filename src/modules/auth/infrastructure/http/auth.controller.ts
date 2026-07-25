import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { LoginCommand } from "@modules/auth/application/commands/login/login.command";

import { Public } from "./decorators/public.decorator";
import { LoginRequestDto } from "./dto/login.request.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Log in and receive access and refresh tokens" })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({
    description: "Authentication successful",
    schema: {
      example: {
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: "Invalid request payload" })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  async login(@Body() dto: LoginRequestDto) {
    const tokens = await this.commandBus.execute(new LoginCommand(dto.email, dto.password));
    return { data: tokens };
  }
}
