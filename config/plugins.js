module.exports = () => ({
  email: {
    config: {
      provider: '@strapi/provider-email-nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        secure: false,
      },
      settings: {
        defaultFrom: process.env.GMAIL_USER,
        defaultReplyTo: process.env.GMAIL_USER,
      },
    },
  },
});
