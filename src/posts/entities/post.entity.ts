import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Genres } from "../enum/genres";
import { Albums } from "src/albums/entities/album.entity";
import { PostComments } from "../post-comments/entities/post-comments.entity";
import { PostLikes } from "../post-likes/entities/post-likes.entity";
import { PostReplays } from "../post-comments/post-replays/entities/post-replay.entity";
import { PostReplayLikes } from "../post-comments/post-replays/post-replay-likes/entities/post-replay-like.entity";
import { PostCommentLikes } from "../post-comments/post-comment-likes/entities/post-comment-like.entity";

@Entity({
    name : 'posts'
})

export class Posts {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type : "varchar", nullable : false })
    title : string;

    @Column({ type : "varchar", nullable : false })
    singerName : string;

    @Column({ type : "enum", enum : Genres })
    genre : Genres;

    @Column({ type : "varchar", nullable : true, default : "노래 가사 내용이 존재하지 않습니다." })
    lyrics : string;

    @Column({ type : "varchar", nullable : true })
    postImg : string;

    @Column({ type : "boolean", default : true })
    isOpen : boolean;
    
    @Column({ type : "date", nullable : true })
    releaseDate : Date;

    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;
    
    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp", nullable : true })
    deletedAt : Date;

    @ManyToOne(() => Users, (users) => users.posts, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;

    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Albums, albums => albums.posts,{
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "albumId", referencedColumnName : "id" })
    albums : Albums;

    @Column({ type : "int", name : "albumId", nullable : true })
    albumId : number;

    @OneToMany(() => PostLikes, (postLikes) => postLikes.posts, {
        cascade : true
    })
    postLikes : PostLikes[];

    @OneToMany(() => PostComments, (postComments) => postComments.users, {
        cascade : true
    })
    postComments : PostComments[];

    @OneToMany(() => PostCommentLikes, (postCommentLikes) => postCommentLikes.posts, {
        cascade : true
    })
    postCommentLikes : PostCommentLikes[];

    @OneToMany(() => PostReplays, (postReplays) => postReplays.posts, {
        cascade : true
    })
    postReplays : PostReplays[];

    @OneToMany(() => PostReplayLikes, (postReplayLikes) => postReplayLikes.posts, {
        cascade : true
    })
    postReplayLikes : PostReplayLikes[];
}
