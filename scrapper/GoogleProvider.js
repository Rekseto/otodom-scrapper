const nodemailer = require("nodemailer");
const {google} = require("googleapis");
const {promisify} = require("util");
const fs = require("fs");
const credentials = require("./google-creds.json");

const OAuth2 = google.auth.OAuth2;

class GoogleProvider {
  async loadCredentials() {
    const credentialsPath = path.resolve(__dirname, "./google-creds.json");

    const credentials = await promisify(fs.readFile)(credentialsPath, {
      encoding: "utf-8"
    });

    this.credentials = JSON.parse(credentials);
  }

  async initialize() {
    const {client_id, client_secret, refresh_token} = credentials.web;

    const oauth2Client = new OAuth2(
      client_id, // ClientID
      client_secret, // Client Secret
      "https://developers.google.com/oauthplayground" // Redirect URL
    );

    oauth2Client.setCredentials({
      refresh_token
    });

    const tokens = await oauth2Client.refreshAccessToken();
    const accessToken = tokens.credentials.access_token;

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "otodomscrapper@gmail.com",
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: refresh_token,
        accessToken
      }
    });

    this.smtpTransport = smtpTransport;
  }

  async sendMail(content, to, topic) {
    const mailOptions = {
      from: "otodomscrapper@gmail.com",
      to: to,
      subject: topic,
      generateTextFromHTML: true,
      html: content
    };

    this.smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        logger.error(error.message);
      }
    });
  }
}

module.exports = GoogleProvider;
