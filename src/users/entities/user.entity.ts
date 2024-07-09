import { Posts } from "src/posts/entities/post.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name : 'users'
})

export class Users {
    @PrimaryGeneratedColumn()
    userId : number;

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

    @CreateDateColumn({ type : 'date' })
    createdAt : Date;

    @UpdateDateColumn({ type : 'date' })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp" })
    deletedAt : Date;

    @OneToMany(() => Posts, (posts) => posts.users, {
        cascade : true
    })
    posts : Posts;
}
