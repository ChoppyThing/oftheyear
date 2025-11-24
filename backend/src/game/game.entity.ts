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
} from 'typeorm';
import { Status } from './status.enum';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/user.entity';

@Entity()
@Unique(['name'])
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true, name: 'image' })
  private _image: string;

  // Getter qui garantit toujours que l'image commence par "uploads/"
  get image(): string {
    if (!this._image) return null;
    if (this._image.startsWith('uploads/')) return this._image;
    return `uploads/${this._image}`;
  }

  // Setter pour permettre l'assignation
  set image(value: string) {
    this._image = value;
  }

  @Column({ nullable: true })
  developer: string;

  @Column({ select: false, nullable: true })
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