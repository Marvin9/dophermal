import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {GithubModule} from 'src/github/github.module';
import {UserModule} from 'src/user/user.module';
import {UserService} from 'src/user/user.service';
import {AuthService} from './auth.service';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
  imports: [
    GithubModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {expiresIn: '1h'},
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UserService, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
