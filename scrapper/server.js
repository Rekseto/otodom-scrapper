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
const errorMiddleware = require("./api/middlewares/errorMiddleware");

// paths

const routes = path.resolve(__dirname, "./api/routes");
const servicesPath = path.resolve(__dirname, "./api/services");

async function startServer() {
  const logger = setupLogger("test");

  // Http module configuration
  const router = new Router();
  const http = new Koa();

  const services = {};

  const servicesFiles = await promisify(fs.readdir)(servicesPath);

  for (const serviceFile of servicesFiles) {
    const creator = require(path.resolve("./api/services", serviceFile));
    services[creator.name] = creator({logger});
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

  callDir.loadAll(routes, rPath => require(rPath)(router, {logger, services}));

  // Everything's loaded so we can start our http module
  http.listen(process.env.BACKEND_PORT || 3000);
}

startServer();
