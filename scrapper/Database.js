const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const {promisify} = require("util");

/**
 * @class   {Database}
 * @export  {Database}
 * @access  public
 */
class Database {
  /**
   * Imported models.
   *
   * @type    {Object}
   * @access  private
   */

  /**
   * Connection to database.
   *
   * @access  public
   */

  /**
   * Creates a connection to a database.
   *
   * @param   {Object}    config              Configuration object
   * @param   {string}    config.host         Database host
   * @param   {string}    config.port         Database port
   * @param   {string}    config.username     Database username
   * @param   {string}    config.password     Database password
   * @param   {string}    config.database     Database name
   */
  constructor(config = {}, {logger}) {
    this.models = {};
    this.connection = null;
    this.config = config;
    this.mongoose = mongoose;
    this.logger = logger;
  }

  /**
   * Connects to a database and loads all the models.
   *
   * @return  {Promise}
   * @access  private
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const {
          DATABASE_HOST,
          DATABASE_USER,
          DATABASE_PASS,
          DATABASE_PORT,
          DATABASE_NAME
        } = this.config;

        // @TODO protect database with user and password
        this.mongoose.connect(
          `mongodb://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`,
          {
            useNewUrlParser: true,
            autoReconnect: true,
            reconnectTries: 10,
            reconnectInterval: 500
          }
        );
        this.connection = mongoose.connection;

        resolve(this.mongoose);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Loads a model and saved it for further usage.
   *
   * @param   {string}  resource
   * @return  {void}
   * @access  public
   */
  load(resource) {
    this.models[resource.modelName] = this.mongoose.model(
      resource.modelName,
      resource.schema
    );
  }

  get(name) {
    if (!(name in this.models)) {
      // @todo create custom error class
      throw new Error(`Model "${name}" not defined`);
    }

    return this.models[name];
  }

  async startDatabase(dependencies) {
    try {
      const modelsFiles = await promisify(fs.readdir)(
        path.resolve(__dirname, "./api/models")
      );

      for (const modelFile of modelsFiles) {
        const model = require(path.resolve(
          __dirname,
          "./api/models",
          modelFile
        ));
        this.load(model(this.mongoose));
      }
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
    await this.connect();
  }
}

module.exports = Database;
