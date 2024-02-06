import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {GithubModule} from 'src/github/github.module';

@Module({
  imports: [GithubModule],
  controllers: [AuthController],
})
export class AuthModule {}
