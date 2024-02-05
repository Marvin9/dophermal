import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-github2';
import configuration from 'src/config/configuration';

@Injectable()
export class DophermalGithubStrategy extends PassportStrategy(
  Strategy,
  'github',
) {
  constructor(
    private readonly configService: ConfigService<typeof configuration>,
  ) {
    super({
      clientID: configService.get('github.client_id'),
      clientSecret: configService.get('github.client_secret'),
      callbackURL: configService.get('github.callback_url'),
    });
  }

  async validate() {
    console.log('validate');
  }
}
