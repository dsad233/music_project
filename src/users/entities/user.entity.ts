import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn({ type : 'timestamp' })
    createdAt : Date

    @UpdateDateColumn({ type : 'timestamp' })
    updatedAt : Date
}
