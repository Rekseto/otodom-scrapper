const defaultConfiguration = {
  name: "DefaultConfiguration",
  maxPrice: 250000,
  minPrice: 150000,
  city: "poznan",
  placeType: "flat",
  mailInterval: "0 6 * * *",
  clearDatabaseInterval: "0 0 * * 1,5",
  scrapInterval: "0 0 * * *",
  actual: true,
  email: "ReksetoAjxer@gmail.com"
};

class ConfigurationManager {
  constructor(dependencies) {
    const {logger, database} = dependencies;

    this.logger = logger;
    this.database = database;

    this.configuration = null;
  }

  async createDefaultConfiguration() {
    const {configurationModel} = this.database.models;

    const exists = await configurationModel.findOne({
      name: "DefaultConfiguration"
    });
    if (exists) return;

    const configuration = await configurationModel.create(defaultConfiguration);
    return configuration;
  }

  async initializeConfiguration() {
    try {
      const {configurationModel} = this.database.models;

      const configuration = await configurationModel.findOne({
        actual: true
      });

      if (configuration) {
        this.configuration = configuration.toObject();
        return;
      }

      const defConf = await configurationModel.findOne({
        name: "DefaultConfiguration"
      });

      if (defConf) {
        this.configuration = defConf.toObject();
        return;
      }

      this.configuration = await this.createDefaultConfiguration().toObject();
    } catch (error) {
      this.logger.error(error.message);
      this.configuration = defaultConfiguration;
    }
  }
  async setConfiguration(name) {
    const nextConfiguration = await configurationModel.find({
      name
    });

    if (nextConfiguration) {
      const actualConfiguration = await configurationModel.find({
        actual: true
      });

      actualConfiguration.actual = false;
      nextConfiguration.actual = true;

      await Promise.all([actualConfiguration.save, nextConfiguration.save]);
      this.configuration = nextConfiguration.toObject();
    }
  }

  async createConfiguration(configuration) {}
}

module.exports = ConfigurationManager;
