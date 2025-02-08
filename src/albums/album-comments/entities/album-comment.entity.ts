import { Albums } from "src/albums/entities/album.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name : "album_comments"
})

export class AlbumComment {
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

    @ManyToOne(() => Users, (users) => users.albumComment, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;
    
    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Albums, (albums) => albums.albumComment, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "albumId", referencedColumnName : "id" })
    albums : Albums;

    @Column({ type : "int", name : "albumId", nullable : false })
    albumId : number;
}
