import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Game } from '../game/game.entity';
import { Category } from '../category/category.entity';

@Entity()
@Index(['user', 'category', 'game'], { unique: true })
export class CategoryVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'CASCADE' })
  category: Category;

  @ManyToOne(() => Game, { nullable: false, onDelete: 'CASCADE' })
  game: Game;

  @CreateDateColumn()
  votedAt: Date;
}
