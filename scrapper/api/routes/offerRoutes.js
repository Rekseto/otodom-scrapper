const queryString = require("querystring");
const R = require("ramda");

module.exports = function(router, dependencies) {
  // Services
  const {logger, services, configurationManager} = dependencies;
  const {configuration} = configurationManager;
  const {offersServices} = services;

  router.get("/offers", async (ctx, next) => {
    try {
      const data = await offersServices.getCheapestOffers();

      ctx.body = {
        success: true,
        data
      };
    } catch (error) {}
  });
};
