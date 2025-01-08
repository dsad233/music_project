import { Albums } from "src/albums/entities/album.entity";
import { Posts } from "src/posts/entities/post.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Roles } from "./roles.entity";
import { PostComments } from "src/posts/post-comments/entities/post-comments.entity";
import { PostLikes } from "src/posts/post-likes/entities/post-likes.entity";
import { PostReplays } from "src/posts/post-comments/post-replays/entities/post-replay.entity";
import { PostReplayLikes } from "src/posts/post-comments/post-replays/post-replay-likes/entities/post-replay-like.entity";
import { PostCommentLikes } from "src/posts/post-comments/post-comment-likes/entities/post-comment-like.entity";

@Entity({
    name : 'users'
})

export class Users {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type : 'varchar', nullable : false, unique : true })
    email : string;

    @Column({ type : 'varchar', nullable : false })
    password : string;

    @Column({ type : 'varchar', nullable : true })
    image : string;

    @Column({ type : 'varchar', nullable : false, unique : true })
    nickname : string;

    @Column({ type : 'varchar', nullable : false })
    address : string;

    @Column({ type : 'varchar', nullable : true, unique : true })
    phoneNumber : string;

    @Column({ type : 'boolean', default : true })
    isOpen : boolean;

    @CreateDateColumn({ type : 'timestamp' })
    createdAt : Date;

    @UpdateDateColumn({ type : 'timestamp' })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp", nullable : true })
    deletedAt : Date;

    @OneToMany(() => Posts, (posts) => posts.users, {
        cascade : true
    })
    posts : Posts[];

    @OneToMany(() => Albums, (albums) => albums.users, {
        cascade : true
    })
    albums : Albums[];

    @OneToMany(() => Roles, (roles) => roles.users, {
        cascade : true
    })
    roles : Roles[];

    @OneToMany(() => PostLikes, (postLikes) => postLikes.users, {
        cascade : true
    })
    postLikes : PostLikes[];
    
    @OneToMany(() => PostComments, (postComments) => postComments.users, {
        cascade : true
    })
    postComments : PostComments[];

    @OneToMany(() => PostCommentLikes, (postCommentLikes) => postCommentLikes.users, {
        cascade : true
    })
    postCommentLikes : PostCommentLikes[];

    @OneToMany(() => PostReplays, (postReplays) => postReplays.users, {
        cascade : true
    })
    postReplays : PostReplays[];

    @OneToMany(() => PostReplayLikes, (postReplayLikes) => postReplayLikes.users, {
        cascade : true
    })
    postReplayLikes : PostReplayLikes[];
}
