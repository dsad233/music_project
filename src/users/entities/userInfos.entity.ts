import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users.entity";

@Entity({
    name : "user_infos"
})

export class UserInfos {
    @PrimaryColumn()
    id : number;

    @Column({ type : 'varchar', nullable : false })
    address : string;

    @Column({ type : 'varchar', nullable : true })
    image : string;

    @Column({ type : 'varchar', nullable : true, unique : true })
    phoneNumber : string;

    @OneToOne(() => Users, (users) => users.userInfos, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "id" })
    users : Users;
}