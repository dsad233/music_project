import { Posts } from "src/posts/entities/post.entity";
import { Genres } from "src/posts/enum/genres";
import { Users } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity({
    name : "albums"
})

export class Albums {
    @PrimaryGeneratedColumn()
    albumId : number;

    @Column({ type : "varchar", nullable : true })
    albumImage : string;

    @Column({ type : "varchar", nullable : false })
    albumTitle : string;
    
    @Column({ type : "varchar", nullable : false })
    albumSingerName : string;

    @Column({ type : "varchar", nullable : false })
    albumInfo : string;

    @Column({ type : "enum", enum : Genres })
    albumGenre : Genres[];

    @Column({ type : "date", nullable : true })
    albumRelease : Date;

    @CreateDateColumn({ type : "date" })
    createdAt : Date;
    
    @UpdateDateColumn({ type : "date" })
    updatedAt : Date;

    // @OneToMany(() => Posts, posts => posts.albums, {
    //     cascade : true
    // })
    // posts : Posts[];

    @ManyToOne(() => Users, users => users.albums, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "userId" })
    users : Users;

    @Column({ type : "int", name : "userId" })
    userId : number;
    
}
