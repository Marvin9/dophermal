import {Entity, Column, PrimaryColumn} from 'typeorm';

@Entity()
export class User {
  /**
   * Github id
   */
  @PrimaryColumn()
  id: number;

  @Column()
  email: string;

  /**
   * Github username
   */
  @Column()
  username: string;
}
