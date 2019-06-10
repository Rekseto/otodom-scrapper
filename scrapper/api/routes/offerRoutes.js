const queryString = require("querystring");
const R = require("ramda");
const fetch = require("node-fetch");

module.exports = function(router, dependencies) {
  // Services
  const {logger, services} = dependencies;
  const {offersServices} = services;
  const {fetchOffers} = offersServices;

  //
  const defaultOfferSearchArgs = {
    maxPrice: 35000000,
    minPrice: 25000000,
    city: "poznan",
    placeType: "flat"
  };

  router.get("/offers", async (ctx, next) => {
    const sortedArgs = R.merge(
      defaultOfferSearchArgs,
      R.pick(["maxPrice", "minPrice"], queryString.parse(ctx.request.query))
    );

    const data = await fetchOffers(sortedArgs);

    ctx.body = {
      success: true,
      data
    };
  });
};
