import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolesEnum } from "../enums/roles.enum";
import { Users } from "./users.entity";

@Entity({
    name : 'roles'
})

export class Roles{
    @PrimaryGeneratedColumn()
    id : number;
    
    @Column({ type : "enum", enum : RolesEnum, default : RolesEnum.user })
    roleName : RolesEnum;

    @CreateDateColumn({ type : "timestamp" })
    createdAt : Date;

    @UpdateDateColumn({ type : "timestamp" })
    updatedAt : Date;

    @DeleteDateColumn({ type : "timestamp" })
    deletedAt : Date;


    @ManyToOne(() => Users, (users) => users.roles, {
        onDelete : 'CASCADE'
    })
    @JoinColumn({ name : "userId", referencedColumnName : "userId" })
    users : Users;

    @Column({ type : "int", name : "userId" })
    userId : number;
}