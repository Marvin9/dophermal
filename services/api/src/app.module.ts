import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {HttpModule} from '@nestjs/axios';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import configuration from './config/configuration';
import {DophermalGithubStrategy} from './github/github.strategy';
import {GithubService} from './github/github.service';
import {GithubModule} from './github/github.module';
import {UserModule} from './user/user.module';
import {JwtStrategy} from './auth/jwt.strategy';
import {APP_GUARD} from '@nestjs/core';
import {JwtAuthGuard} from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('database.path'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    GithubModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DophermalGithubStrategy,
    GithubService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
