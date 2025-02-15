import { Albums } from "src/albums/entities/album.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AlbumReplays } from "../album-replays/entities/album-replay.entity";
import { AlbumReplayLikes } from "../album-replays/album-replay-likes/entities/album-replay-like.entity";

@Entity({
    name : "album_comments"
})

export class AlbumComments {
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

    @ManyToOne(() => Users, (users) => users.albumComments, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "id" })
    users : Users;
    
    @Column({ type : "int", name : "userId", nullable : false })
    userId : number;

    @ManyToOne(() => Albums, (albums) => albums.albumComments, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "albumId", referencedColumnName : "id" })
    albums : Albums;

    @Column({ type : "int", name : "albumId", nullable : false })
    albumId : number;

    @OneToMany(() => AlbumReplays, (albumReplays) => albumReplays.albumComments, {
        cascade : true
    })
    albumReplays : AlbumReplays[];

    @OneToMany(() => AlbumReplayLikes, (albumReplayLikes) => albumReplayLikes.albumComments, {
        cascade : true
    })
    albumReplayLikes : AlbumReplayLikes[];
}
