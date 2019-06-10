module.exports = function(mongoose) {
  const Schema = mongoose.Schema;

  const configurationModel = new Schema({
    maxPrice: {type: Number},
    minPrice: {type: Number},
    city: {type: String},
    placeType: {type: String},
    mailInterval: {type: String},
    scrapInterval: {type: String}
  });

  return {schema: configurationModel, modelName: "configurationModel"};
};
