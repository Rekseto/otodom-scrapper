const errors = require("../../errors/");

const defaultError = {
  httpStatus: 500,
  errorCode: 1,
  message: "Internal Server Error"
};

function errorMiddleware({logger}) {
  return async function(ctx, next) {
    try {
      await next();
    } catch (error) {
      let response = defaultError;

      errors.forEach(instance => {
        if (error instanceof instance) {
          response = error;
        }
      });

      logger.error(error.message);

      ctx.status = error.httpStatus;

      ctx.body = {
        success: false,
        error: response
      };
    }
  };
}

module.exports = errorMiddleware;
