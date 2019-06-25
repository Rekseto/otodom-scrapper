module.exports = function(mongoose) {
  const Schema = mongoose.Schema;

  const configurationModel = new Schema({
    name: {type: String, unique: true},
    maxPrice: {type: Number},
    minPrice: {type: Number},
    city: {type: String},
    placeType: {type: String},
    mailInterval: {type: String},
    scrapInterval: {type: String},
    actual: {type: Boolean, required: true},
    email: {type: String, required: true},
    clearDatabaseInterval: {type: String, required: true}
  });

  return {schema: configurationModel, modelName: "configurationModel"};
};
