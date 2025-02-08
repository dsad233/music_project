import { Posts } from "src/posts/entities/posts.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name : "post_likes"
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
    
    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Posts, (posts) => posts.postLikes, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "postId", referencedColumnName : "id" })
    posts : Posts;

    @Column({ type : "int", name : "postId", nullable : false })
    postId : number;
}
