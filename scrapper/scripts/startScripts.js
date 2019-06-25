module.exports = async function({
  cronManager,
  configurationManager,
  logger,
  services
}) {
  const {offersServices, mailingServices} = services;
  const {configuration} = configurationManager;

  offersServices.scrapOffers(configuration);
  offersServices.deleteExpiredOffers();

  const cheapestOffers = await offersServices.getCheapestOffers();
  mailingServices.sendOffersMail({cheapestOffers});
};
 