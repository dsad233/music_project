import { Users } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Genres } from "../enum/genres";
import { Albums } from "src/albums/entities/album.entity";

@Entity({
    name : 'posts'
})

export class Posts {
    @PrimaryGeneratedColumn()
    postId : number;

    @Column({ type : "varchar", nullable : false })
    title : string;

    @Column({ type : "varchar", nullable : false })
    singerName : string;

    @Column({ type : "enum", enum : Genres })
    genre : Genres;

    @Column({ type : "varchar", nullable : true, default : "가사가 존재하지 않습니다." })
    lyrics : string;

    @Column({ type : "varchar", nullable : true })
    postImg : string;

    // @Column({ type : "boolean", default : false })
    // isBlack : string;
    
    @Column({ type : "date", nullable : true })
    ReleaseDate : Date;

    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;
    
    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp" })
    deletedAt : Date;

    @ManyToOne(() => Users, (users) => users.posts, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "userId" })
    users : Users;

    @Column({ type : "int", name : "userId" })
    userId : number;

    @ManyToOne(() => Albums, albums => albums.posts,{
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "albumId", referencedColumnName : "albumId" })
    albums : Albums;

    @Column({ type : "int", name : "albumId", nullable : true })
    albumId : number;

}
