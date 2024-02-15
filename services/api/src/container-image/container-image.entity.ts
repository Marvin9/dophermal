import {ContainerConfig} from 'src/container-config/container-config.entity';
import {User} from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
