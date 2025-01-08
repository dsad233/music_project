import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostReplays } from "../../entities/post-replay.entity";
import { Posts } from "src/posts/entities/post.entity";
import { PostComments } from "src/posts/post-comments/entities/post-comments.entity";

@Entity({
    name : "post-replay-likes"
})
export class PostReplayLikes {
    @PrimaryGeneratedColumn()
    id : number;
    
    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;
        
    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @ManyToOne(() => Users, (users) => users.postReplayLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;

    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Posts, (posts) => posts.postReplayLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "postId", referencedColumnName : "id" })
    posts : Posts;

    @Column({ type : "int", name : "postId", nullable : false })
    postId : number;

    @ManyToOne(() => PostComments, (postComments) => postComments.postReplayLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "postCommentId", referencedColumnName : "id" })
    postComments : PostComments;
    
    @Column({ type : "int", name : "postCommentId", nullable : false })
    postCommentId : number;
    
    @ManyToOne(() => PostReplays, (postReplays) => postReplays.postReplayLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "postReplayId", referencedColumnName : "id" })
    postReplays : PostReplays;

    @Column({ type : 'int', name : "postReplayId", nullable : false })
    postReplayId : number;
}
