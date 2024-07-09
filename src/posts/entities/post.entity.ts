import { Users } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Genres } from "../enum/genres";

@Entity({
    name : 'posts'
})

export class Posts {
    @PrimaryGeneratedColumn()
    postId : number;

    @Column({ type : "varchar", nullable : false })
    title : string;

    @Column({ type : "enum", enum : Genres })
    genre : Genres;

    @Column({ type : "varchar", nullable : true, default : "가사가 존재하지 않습니다." })
    lyrics : string;
    
    @Column({ type : "varchar", nullable : false })
    albumTitle : string;

    @Column({ type : "varchar", nullable : false })
    albumInfo : string;

    @Column({ type : "varchar", nullable : true })
    postImg : string;

    // @Column({ type : "boolean", default : false })
    // isBlack : string;

    @CreateDateColumn({ type : "date" })
    createdAt : Date;
    
    @UpdateDateColumn({ type : "date" })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp" })
    deletedAt : Date;

    @ManyToOne(() => Users, (users) => users.posts, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "userId" })
    users : Users;

    @Column({ type : "int" ,name : "userId" })
    userId : number;

    @Column({ type : "varchar", name : "nickname" })
    nickname : string;
}
