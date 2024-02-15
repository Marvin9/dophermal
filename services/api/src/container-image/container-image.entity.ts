import {ContainerConfig} from 'src/container-config/container-config.entity';
import {User} from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CONTAINER_IMAGE_STATUS {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
  TERMINATING_IN_PROGRESS = 'TERMINATING_IN_PROGRESS',
  TERMINATED = 'TERMINATED',
  UNKNOWN = 'UNKNOWN',
}

@Entity()
export class ContainerImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pullImageUrl: string;

  @Column()
  pullRequestNumber: number;

  @Column()
  githubRepoName: string;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @ManyToOne(() => ContainerConfig)
  @JoinColumn()
  containerConfig: ContainerConfig;

  @Column({
    default: CONTAINER_IMAGE_STATUS.INITIATED,
  })
  status: CONTAINER_IMAGE_STATUS;
}
