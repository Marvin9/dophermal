import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {GithubModule} from 'src/github/github.module';
import {UserModule} from 'src/user/user.module';
import {UserService} from 'src/user/user.service';

@Module({
  imports: [GithubModule, UserModule],
  providers: [UserService],
  controllers: [AuthController],
})
export class AuthModule {}
