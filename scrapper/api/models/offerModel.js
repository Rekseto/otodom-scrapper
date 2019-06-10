module.exports = function(mongoose) {
  const Schema = mongoose.Schema;
  const offerModel = new Schema({
    sent: {type: Boolean, required: true},
    price: {type: Number},
    pricePerM: {type: Number},
    area: {type: Number},
    rooms: {type: Number}
    // @TODO addtional infos
  });

  return {schema: offerModel, modelName: "offerModel"};
};
