module.exports = (sequelize, DataType) => {
  const DataSets = sequelize.define('DataSets', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name:{
      type: DataType.STRING,
      unique:true
    },
    images: {
      type: DataType.STRING,
      unique:true
    },
  }, {
    classMethods: {
      associate: (models) => {
      },
    },
  });
  return DataSets;
};
