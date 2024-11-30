import { Posts } from "src/posts/entities/post.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name : 'post-comments'
})

export class PostComments {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type : "varchar", nullable : false })
    context : string;

    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;

    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp", nullable : true })
    deletedAt : Date;
    
    @ManyToOne(() => Users, (users) => users.postComments, {
       onDelete : 'CASCADE' 
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;

    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Posts, (posts) => posts.postComments,{
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "postId", referencedColumnName : "id" })
    posts : Posts;
    
    @Column({ type : "int", name : "postId", nullable : false })
    postId : number;
    
}
