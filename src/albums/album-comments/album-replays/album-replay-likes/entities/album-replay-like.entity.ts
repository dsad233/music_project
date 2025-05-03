import { AlbumComments } from 'src/albums/album-comments/entities/album-comment.entity';
import { Albums } from 'src/albums/entities/album.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AlbumReplays } from '../../entities/album-replay.entity';

@Entity({
  name: 'album_replay_likes',
})
export class AlbumReplayLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.albumReplayLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  users: Users;

  @Column({ type: 'int', name: 'userId', nullable: false })
  userId: number;

  @ManyToOne(() => Albums, (albums) => albums.albumReplayLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'albumId', referencedColumnName: 'id' })
  albums: Albums;

  @Column({ type: 'int', name: 'albumId', nullable: false })
  albumId: number;

  @ManyToOne(
    () => AlbumComments,
    (albumComments) => albumComments.albumReplayLikes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'albumCommentId', referencedColumnName: 'id' })
  albumComments: AlbumComments;

  @Column({ type: 'int', name: 'albumCommentId', nullable: false })
  albumCommentId: number;

  @ManyToOne(
    () => AlbumReplays,
    (albumReplays) => albumReplays.albumReplayLikes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'albumReplayId', referencedColumnName: 'id' })
  albumReplays: AlbumReplays;

  @Column({ type: 'int', name: 'albumReplayId', nullable: false })
  albumReplayId: number;
}
