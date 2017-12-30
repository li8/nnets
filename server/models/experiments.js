module.exports = (sequelize, DataType) => {
  const Experiments = sequelize.define('Experiments', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    i: {
      type: DataType.STRING,
    },
    j: {
      type: DataType.STRING,
    },
    k: {
      type: DataType.STRING,
    },
    accuracy:{
      type:DataType.DECIMAL,
    },
  }, {
    classMethods: {
      associate: (models) => {
        Experiments.belongsTo(models.DataSets);
      },
    },
  });
  return Experiments;
};
