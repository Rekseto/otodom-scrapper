const rootDomain = "https://www.otodom.pl/";

const filtersFunctions = {
  placeTypeFilter: type => {
    switch (type) {
      case "flat":
        return "mieszkanie";
      case "house":
        return "dom";
      default:
        return "mieszkanie";
    }
  },
  distanceFilter: (distance = 0) => {
    return `search[dist]=${distance}`;
  },
  roomsFilter: (rooms = 2) => {
    return `search[filter_enum_rooms_num][0]=${rooms}`;
  },
  minSquareFilter: (min = 45) => {
    return `search[filter_float_m:from]=${min}`;
  },
  maxSquareFilter: (max = 50) => {
    return `search[filter_float_m:to]=${max}`;
  },
  maxPriceFilter: (max = 20) => {
    return `search[filter_float_price:to]=${max}`;
  },
  minPriceFilter: (min = 10) => {
    return `search[filter_float_price:from]=${min}`;
  }
};

const buildURL = (filters, page = 1) => {
  let url = `${rootDomain}sprzedaz/mieszkanie/${filters.city}/?`;

  Object.keys(filters).forEach(filterName => {
    if (filtersFunctions[`${filterName}Filter`]) {
      url =
        url +
        filtersFunctions[`${filterName}Filter`](filters[filterName]) +
        "&";
    }
  });

  return `${url}&page=${page}`;
};

module.exports = buildURL;
