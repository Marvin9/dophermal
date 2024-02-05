import {Controller, Get, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard('github'))
  @Get('login')
  async login() {}

  @Get('callback')
  async callback() {}
}
