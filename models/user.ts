import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Post from './post';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public posts?: Post[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'Users',
  }
);

export default User;
