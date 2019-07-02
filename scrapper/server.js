const Koa = require("koa");
const Router = require("koa-router");
const callDir = require("call-dir");
const body = require("koa-body");
const cors = require("koa-cors");
const morgan = require("koa-morgan");
const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
const {promisify} = require("util");

const {setupLogger} = require("./logger");
const CronManager = require("./CronManager");
const GoogleProvider = require("./GoogleProvider");
const ConfigurationManager = require("./ConfigurationManager");
const Database = require("./Database");
const errorMiddleware = require("./api/middlewares/errorMiddleware");

// paths

const routes = path.resolve(__dirname, "./api/routes");
const servicesPath = path.resolve(__dirname, "./api/services");
const scriptsPath = path.resolve(__dirname, "./scripts");

async function startServer() {
  const logger = setupLogger("test");

  const database = new Database(process.env, {logger});
  await database.startDatabase();

  const configurationManager = new ConfigurationManager({logger, database});
  await configurationManager.initializeConfiguration();

  // Http module configuration
  const router = new Router();
  const http = new Koa();
  const cronManager = new CronManager();

  const googleProvider = new GoogleProvider();
  await googleProvider.initialize();

  const services = {};

  const servicesFiles = await promisify(fs.readdir)(servicesPath);

  for (const serviceFile of servicesFiles) {
    const creator = require(path.resolve("./api/services", serviceFile));
    services[creator.name] = creator({
      logger,
      database,
      configurationManager,
      googleProvider
    });
  }

  const scriptsFiles = await promisify(fs.readdir)(scriptsPath);

  for (const scriptFile of scriptsFiles) {
    const script = require(path.resolve("./scripts", scriptFile));

    await script({
      services,
      logger,
      database,
      configurationManager,
      cronManager,
      googleProvider
    });
  }

  http.use(
    morgan(function(tokens, req, res) {
      return [
        `[${chalk.green(tokens.method(req, res))}]`,
        tokens.url(req, res),
        tokens.status(req, res),
        `${tokens.res(req, res, "content-length")}B`,
        "-",
        chalk.yellow(tokens["response-time"](req, res)),
        chalk.yellow("ms")
      ].join(" ");
    })
  );
  http.use(body());
  http.use(cors());
  http.use(errorMiddleware({logger}));
  http.use(router.routes());
  http.use(router.allowedMethods());

  //

  callDir.loadAll(routes, rPath =>
    require(rPath)(router, {logger, services, database, configurationManager})
  );

  // Everything's loaded so we can start our http module
  http.listen(process.env.BACKEND_PORT || 3000);
}

startServer();
