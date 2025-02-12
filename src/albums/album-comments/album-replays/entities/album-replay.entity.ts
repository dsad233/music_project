import { Albums } from "src/albums/entities/album.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AlbumComments } from "../../entities/album-comment.entity";

@Entity({
    name : "album_replays"
})
export class AlbumReplays {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type : "varchar", nullable : false })
    context : string;

    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;

    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp" })
    deletedAt : Date;

    @ManyToOne(() => Users, (users) => users.albumReplays, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;
    
    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Albums, (albums) => albums.albumReplays, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "albumId", referencedColumnName : "id" })
    albums : Albums;

    @Column({ type : "int", name : "albumId", nullable : false })
    albumId : number;

    @ManyToOne(() => AlbumComments, (albumComments) => albumComments.albumReplays, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "albumCommentId", referencedColumnName : "id" })
    albumComments : AlbumComments;

    @Column({ type : "int", name : "albumCommentId", nullable : false })
    albumCommentId : number;
}
