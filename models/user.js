'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    imgAvatar: DataTypes.STRING
  }, {});
//   function works with to User
  User.createNewUser = ({username,password}) => {
    return User.create({username,password})
  }
  User.updateInforAfterCheck = ({fullname,email,imgAvatar}) =>{
    return User.update({fullname:fullname,email:email,imgAvatar:imgAvatar})
  }
  User.getUserByUsername = (username)=>{
    return User.findOne({
      where: {username: username}
    })
  }



  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};