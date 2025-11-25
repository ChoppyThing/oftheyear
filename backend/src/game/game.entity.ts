import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Status } from './status.enum';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/user.entity';
import { Category } from 'src/category/category.entity';

@Entity()
@Unique(['name'])
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  developer: string;

  @Column({ nullable: true })
  editor: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Sent,
  })
  status: Status;

  @Column()
  year: number;

  @ManyToOne(() => User, { nullable: false })
  author: User;

  @ManyToMany(() => Category, (category) => category.restrictedGames)
  @JoinTable({
    name: 'game_category_restriction',
    joinColumn: { name: 'gameId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  allowedCategories: Category[];

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  updatedAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  publishAt: Date;

  @Index({ unique: true })
  @Column()
  slug: string;

  /**
   * Lifetime events
   */
    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      if (!this.slug) {
        const baseSlug = this.slugify(this.name);
        const shortId = uuidv4().substring(0, 8);
        this.slug = `${baseSlug}-${shortId}`;
      }
    }

    private slugify(text: string): string {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
}