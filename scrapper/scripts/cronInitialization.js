module.exports = async function({
  cronManager,
  configurationManager,
  logger,
  services
}) {
  const {offersServices, mailingServices} = services;
  const {configuration} = configurationManager;

  cronManager.registerNewTask(configuration.scrapInterval, () => {
    logger.info("Scrapping has been started");
    offersServices.scrapOffers(configuration);
  });

  cronManager.registerNewTask(configuration.mailInterval, () => {
    offersServices.getCheapestOffers().then(data => {
      mailingServices.sendOffersMail({cheapestOffers: data});
    });
  });

  cronManager.registerNewTask(configuration.clearDatabaseInterval, () => {
    offersServices.deleteExpiredOffers().then(data => {
      mailingServices.sendExpiredOffersMail(data);
    });
  });
};
