import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'text' })
  password: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsEmail()
  @IsOptional()
  email?: string | null;
}