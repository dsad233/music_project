import { Posts } from "src/posts/entities/post.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name : "post-likes"
})

export class PostLikes {
    @PrimaryGeneratedColumn()
    id : number;
    
    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;

    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @ManyToOne(() => Users, (users) => users.postLikes,{
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;
    
    @Column({ name : "userId", type : "int", nullable : false })
    userId : number;

    @ManyToOne(() => Posts, (posts) => posts.postLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "postId", referencedColumnName : "id" })
    posts : Posts;

    @Column({ name : "postId", type : "int", nullable : false })
    postId : number;
}
