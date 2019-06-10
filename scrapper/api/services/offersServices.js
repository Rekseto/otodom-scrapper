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

async function scrapOffers(document) {
  const offers = [];
  const offersList = document.querySelectorAll(".params");

  offersList.forEach(offer => {
    const offerArticle = offer.parentElement.parentElement;
    const offerDetails = {
      id: offerArticle.getAttribute("data-item-id"),
      link: offerArticle.getAttribute("data-url")
    };
    offer.childNodes.forEach(param => {
      if (param && param.className) {
        const property = getPropertyNameByClass(param.className.split(" "));
        offerDetails[property] = param.textContent
          .split(" ")
          .join("")
          .replace(/\D/g, "");
      }
    });
    offers.push(offerDetails);
  });
  return offers;
}

module.exports = function offersServices({logger}) {
  return {
    async fetchOffers(args) {
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

        const offerList = await scrapOffers(document);
        offersLists.push(offerList);
        await delay(5000);
      }

      return R.flatten(offersLists);
    }
  };
};
