import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { CategoryPhase } from './category-phase.enum';
import { CategoryVote } from 'src/category-vote/category-vote.entity';
import { CategoryNominee } from 'src/category-nominee/category-nominee.entity';

@Entity()
@Index(['name', 'year'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'int' })
  year: number;

  @Column({
    type: 'enum',
    enum: CategoryPhase,
    default: CategoryPhase.Nomination,
  })
  phase: CategoryPhase; // Actual phase

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  author: User;

  @OneToMany(() => CategoryVote, (vote) => vote.category)
  votes: CategoryVote[]; // Phase 1

  @OneToMany(() => CategoryNominee, (nominee) => nominee.category)
  nominees: CategoryNominee[]; // Phase 2

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      const baseSlug = this.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;
    }
  }
}
