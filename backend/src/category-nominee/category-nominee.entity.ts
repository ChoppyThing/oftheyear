import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Game } from '../game/game.entity';
import { Category } from '../category/category.entity';
import { FinalVote } from './final-vote.entity';

@Entity()
@Index(['category', 'game', 'user'], { unique: true })
export class CategoryNominee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.nominees, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToOne(() => Game, { nullable: false, onDelete: 'CASCADE' })
  game: Game;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'int', default: 0 })
  nominationCount: number; // Nombre de votes en Phase 1

  @Column({ type: 'int', default: 0 })
  finalVoteCount: number; // Nombre de votes en Phase 2

  @Column({ default: false })
  isWinner: boolean; // Le gagnant de la catégorie

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => FinalVote, (vote) => vote.nominee)
  finalVotes: FinalVote[]; // Les votes de la phase 2
}
