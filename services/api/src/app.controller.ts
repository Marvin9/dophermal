import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import {PublicRoute} from './shared/public-route';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  @PublicRoute()
  protected() {
    return 'pong';
  }
}
