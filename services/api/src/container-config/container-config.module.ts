import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  ContainerConfig,
  RepoLevelContainerConfig,
} from './container-config.entity';
import {ContainerConfigController} from './container-config.controller';
import {ContainerConfigService} from './container-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContainerConfig, RepoLevelContainerConfig]),
  ],
  controllers: [ContainerConfigController],
  providers: [ContainerConfigService],
})
export class ContainerConfigModule {}
