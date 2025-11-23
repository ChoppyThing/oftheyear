import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { CategoryNominee } from '../category-nominee/category-nominee.entity';

@Entity()
@Index(['user', 'category'], { unique: true }) // 1 vote par catégorie
export class FinalVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'CASCADE' })
  category: Category;

  @ManyToOne(() => CategoryNominee, (nominee) => nominee.finalVotes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  nominee: CategoryNominee;

  @CreateDateColumn()
  votedAt: Date;
}
