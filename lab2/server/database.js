const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, 
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false } 
    }
});

const User = sequelize.define('user', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const Post = sequelize.define('post', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const Comment = sequelize.define('comment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Post.hasMany(Comment, { foreignKey: 'post_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

sequelize.sync();

module.exports = { sequelize, User, Post, Comment };