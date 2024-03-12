import {User} from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RepoLevelContainerConfig {
  /**
   * <user>/<repo>
   */
  @PrimaryColumn()
  id: string;

  @OneToMany(() => ContainerConfig, (config) => config, {cascade: true})
  config: ContainerConfig[];

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;
}

@Entity()
export class ContainerConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  port: number;

  @Column('json', {nullable: true})
  keyValueEnv: Record<string, string>;

  @ManyToOne(() => RepoLevelContainerConfig, (config) => config.config)
  repoLevelContainerConfig: RepoLevelContainerConfig;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;
}
