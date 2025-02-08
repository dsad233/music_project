import { Posts } from "src/posts/entities/posts.entity";
import { Genres } from "src/posts/enum/genres";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, DeleteDateColumn } from "typeorm";
import { AlbumComment } from "../album-comments/entities/album-comment.entity";

@Entity({
    name : "albums"
})

export class Albums {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type : "varchar", nullable : false })
    albumTitle : string;
    
    @Column({ type : "varchar", nullable : false })
    albumSingerName : string;

    @Column({ type : "varchar", nullable : true })
    albumImage : string;

    @Column({ type : "varchar", nullable : false, default : "앨범 소개 내용이 존재하지 않습니다." })
    albumInfo : string;

    @Column({ type : "enum", enum : Genres })
    albumGenre : Genres;

    @Column({ type : "date", nullable : true })
    albumRelease : Date;

    @Column({ type : "boolean", default : true })
    isOpen : boolean;

    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;
    
    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp", nullable : true })
    deletedAt : Date;

    @OneToMany(() => Posts, (posts) => posts.albums, {
        cascade : true
    })
    posts : Posts[];

    @ManyToOne(() => Users, (users) => users.albums, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;

    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @OneToMany(() => AlbumComment, (albumComment) => albumComment.albums, {
        cascade : true
    })
    albumComment : AlbumComment[];
}
