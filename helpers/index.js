const nodemailer = require('nodemailer');

exports.kirimEmail = dataEmail => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "gustiky444@gmail.com",
          pass: "nhwi mdbp irbw rbqw",
        },
      });
    return (
        transporter.sendMail(dataEmail)
        .then(info => console.log(`Email Terkirim': ${info.message}`))
        .catch(err => console.log(`Terjadi Kesalahan': ${err}`))
    )
}