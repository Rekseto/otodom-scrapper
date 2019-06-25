const R = require("ramda");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const {promisify} = require("util");

module.exports = function mailingServices({
  logger,
  database,
  googleProvider,
  configurationManager
}) {
  const {configuration} = configurationManager;

  return {
    async sendOffersMail(data) {
      const source = await promisify(fs.readFile)(
        path.resolve("./api/templates/offersNewsletter.hjs"),
        {
          encoding: "utf-8"
        }
      );

      const content = Handlebars.compile(source);

      googleProvider.sendMail(
        content(data),
        configuration.email,
        "OtoDom Oferty"
      );
    },

    async sendExpiredOffersMail(expiredOffers) {
      const source = await promisify(fs.readFile)(
        path.resolve("./api/templates/expiredOffersNewsletter.hjs"),
        {
          encoding: "utf-8"
        }
      );

      const content = Handlebars.compile(source);

      googleProvider.sendMail(
        content({expiredOffers}),
        configuration.email,
        "OtoDom Oferty"
      );
    }
  };
};
