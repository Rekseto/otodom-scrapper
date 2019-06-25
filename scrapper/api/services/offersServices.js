const R = require("ramda");
const jsdom = require("jsdom");
const {JSDOM, HTMLElement} = jsdom;
const fetch = require("node-fetch");
const urlBuilder = require("../../helpers/urlBuilder");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getPropertyNameByClass = classList => {
  for (className of classList) {
    switch (className) {
      case "offer-item-rooms":
        return "rooms";
      case "offer-item-price":
        return "price";
      case "offer-item-area":
        return "area";
      case "offer-item-price-per-m":
        return "pricePerM";
    }
  }

  return "";
};

module.exports = function offersServices({logger, database}) {
  const {offerModel} = database.models;

  return {
    async saveOffer(offer) {
      try {
        const result = await offerModel.create({
          ...offer,
          sent: 0
        });

        if (result) return result;
        else return null;
      } catch (error) {
        logger.error(error);
        return null;
      }
    },
    async findOffer(id) {
      try {
        const data = await offerModel.findOne({
          otoDomId: id
        });

        if (data) return data;
        else return null;
      } catch (error) {
        logger.error(error.message);
        return null;
      }
    },
    async scrapOffers(args) {
      let pages = 2;

      const offersLists = [];
      for (let page = 1; page < pages; page++) {
        const response = await fetch(urlBuilder(args, page));
        const html = await response.text();

        const dom = new JSDOM(html, {includeNodeLocations: true});
        const {document} = dom.window;

        // prettier-ignore
        if (document.querySelector(".current")) {
          const pagesFromDomString = document.querySelector(".current").textContent
          const pagesFromDom = Number.parseInt(pagesFromDomString);

          if (pagesFromDom !== pages) pages = pagesFromDom;

        }

        const offerList = await this.extractOffers(document);
        offersLists.push(offerList);

        await delay(500);
      }

      return R.flatten(offersLists);
    },

    async extractOffers(document) {
      const offers = [];
      const offersList = document.querySelectorAll(".offer-item");

      for (let i = 0; i < offersList.length; i++) {
        const offer = offersList[i];
        const offerId = offer.getAttribute("data-item-id");
        const offerInCache = await this.findOffer(offerId);
        if (offerInCache === null) {
          const offerDetails = {
            otoDomId: offerId,
            link: offer.getAttribute("data-url")
          };

          for (const param of offer.querySelector(".params").childNodes) {
            if (param && param.className) {
              const property = getPropertyNameByClass(
                param.className.split(" ")
              );
              offerDetails[property] = param.textContent
                .split(" ")
                .join("")
                .replace(/\D/g, "");
            }
          }

          await this.saveOffer(offerDetails);
          offers.push(offerDetails);
        }
      }

      return offers;
    },

    async getCheapestOffers(limit = 10) {
      try {
        const data = await offerModel
          .find({
            sent: 0
          })
          .sort("price")
          .limit(limit)
          .exec();
        return data;
      } catch (error) {
        throw error;
      }
    },
    async deleteExpiredOffers() {
      const offers = await offerModel.find({});

      const result = [];

      for (const offer of offers) {
        const response = await fetch(offer.link);

        if (response.redirected) {
          result.push(offer.toObject());
          await offer.remove();
        }
      }

      return result;
    }
  };
};
