import { Posts } from "src/posts/entities/posts.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostComments } from "../../entities/post-comments.entity";

@Entity({
    name : "post_comment_likes"
})

export class PostCommentLikes {
    @PrimaryGeneratedColumn()
    id : number;

    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;
    
    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @ManyToOne(() => Users, (users) => users.postCommentLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;
    
    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Posts, (posts) => posts.postCommentLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "postId", referencedColumnName : "id" })
    posts : Posts;

    @Column({ type : "int", name : "postId", nullable : false })
    postId : number;

    @ManyToOne(() => PostComments, (postComments) => postComments.postCommentLikes, {
        onDelete : 'CASCADE' 
    })
    @JoinColumn({ name : "postCommentId", referencedColumnName : "id" })
    postComments : PostComments;

    @Column({ type : "int", name : "postCommentId", nullable : false })
    postCommentId : number;
}
