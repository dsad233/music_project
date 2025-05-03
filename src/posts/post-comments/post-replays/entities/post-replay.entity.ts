import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostComments } from '../../entities/post-comments.entity';
import { Posts } from 'src/posts/entities/posts.entity';
import { Users } from 'src/users/entities/users.entity';
import { PostReplayLikes } from '../post-replay-likes/entities/post-replay-like.entity';

@Entity({
  name: 'post_replays',
})
export class PostReplays {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  context: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Users, (users) => users.postReplays, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  users: Users;

  @Column({ type: 'int', name: 'userId', nullable: false })
  userId: number;

  @ManyToOne(() => Posts, (posts) => posts.postReplays, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  posts: Posts;

  @Column({ type: 'int', name: 'postId', nullable: false })
  postId: number;

  @ManyToOne(() => PostComments, (postComments) => postComments.postReplays, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postCommentId', referencedColumnName: 'id' })
  postComments: PostComments;

  @Column({ type: 'int', name: 'postCommentId', nullable: false })
  postCommentId: number;

  @OneToMany(
    () => PostReplayLikes,
    (postReplayLikes) => postReplayLikes.postReplays,
    {
      cascade: true,
    },
  )
  postReplayLikes: PostReplayLikes[];
}
