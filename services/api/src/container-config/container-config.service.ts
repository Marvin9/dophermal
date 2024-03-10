import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {
  ContainerConfig,
  RepoLevelContainerConfig,
} from './container-config.entity';
import {Repository} from 'typeorm';
import {
  ContainerConfigDto,
  RepoLevelContainerConfigDto,
} from './container-config.dto';
import {User} from 'src/user/user.entity';

@Injectable()
export class ContainerConfigService {
  constructor(
    @InjectRepository(ContainerConfig)
    private containerConfigRepository: Repository<ContainerConfig>,
    @InjectRepository(RepoLevelContainerConfig)
    private repoLevelContainerConfigRepository: Repository<RepoLevelContainerConfig>,
  ) {}

  createConfig(containerConfigDto: ContainerConfigDto, user: User) {
    const containerConfig = new ContainerConfig();

    containerConfig.port = containerConfigDto.port;
    containerConfig.keyValueEnv = containerConfigDto.keyValueEnv;
    containerConfig.createdBy = user;

    return this.containerConfigRepository.save(containerConfig);
  }

  listConfig(user: User) {
    return this.containerConfigRepository.find({where: {createdBy: user}});
  }

  async createRepoConfig(
    repoLevelContainerConfigDto: RepoLevelContainerConfigDto,
    user: User,
  ) {
    const containerConfig = new ContainerConfig();

    const repoLevelContainerConfig =
      await this.repoLevelContainerConfigRepository.save({
        id: repoLevelContainerConfigDto.id,
        createdBy: user,
      });

    containerConfig.port = repoLevelContainerConfigDto.config.port;
    containerConfig.keyValueEnv =
      repoLevelContainerConfigDto.config.keyValueEnv;
    containerConfig.repoLevelContainerConfig = repoLevelContainerConfig;
    containerConfig.createdBy = user;

    return this.containerConfigRepository.save(containerConfig);
  }

  getConfigById(user: User, id: string) {
    const containerConfig = new ContainerConfig();
    containerConfig.createdBy = user;
    containerConfig.id = id;
    return this.containerConfigRepository.findOne({where: containerConfig});
  }

  listRepoConfig(user: User, repoId: string) {
    const repoLevelContainerConfig = new RepoLevelContainerConfig();
    repoLevelContainerConfig.id = repoId;
    return this.containerConfigRepository.find({
      where: {createdBy: user, id: repoId},
    });
  }

  configExists(user: User, configId: string) {
    return this.containerConfigRepository.exists({
      where: {id: configId, createdBy: user},
    });
  }
}
