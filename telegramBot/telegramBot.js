const { Telegraf } = require("telegraf");
const domainControllers = require("../controllers/domainController");
const userControllers = require("../controllers/userController");
const sendMail = require("../components/sendEmail");
const { v4: uuidv4 } = require("uuid");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const userMailData = {};

const helpMessage="Yapabileceğiniz işlemler:\n /domain_ekle,\n /domain_sil, \n /domain_listele, \n /email_guncelle \n /help "

const sendMessage = async (username, chatId, subject, message) => {
  const messageId = uuidv4();
  if (!userMailData[username]) {
    userMailData[username] = {};
  }
  userMailData[username][messageId] = { subject, message };

  await bot.telegram
    .sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "E-mail Olarak Gönder",
              callback_data: `sendMailer:${username}:${messageId}`,
            },
          ],
        ],
      },
    })
    .then(() => {})
    .catch((error) => {
      console.error("Mesaj gönderilirken bir hata oluştu:ChatId yanlış", error);
    });

  bot.action(/^sendMailer:/, async (ctx) => {
    const username = await ctx.callbackQuery.data.split(":")[1];
    const messageId = await ctx.callbackQuery.data.split(":")[2];
    // console.log(username);

    const { subject, message } = userMailData[username][messageId];

    var isUser = await userControllers.findUser(username);
    // console.log(isUser);
    await sendMail
      .sendMail(isUser.email, subject, message)
      .then((response) => {
        ctx.reply(`Mail Başarıyla Gönderildi`);
      })
      .catch((error) => {
        ctx.reply(`Mail Gönderilemedi.`);
      });
    delete userMailData[username][messageId];
    if (Object.keys(userMailData[username]).length === 0) {
      delete userMailData[username];
    }
  });
};

const telegramBot = () => {
  bot.start(async (ctx) => {
    const username = ctx.msg.from.username;
    ctx.reply(`Hoşgeldiniz...`);
    var isUser = await userControllers.findUser(username);
// console.log(isUser)
    if (!isUser) {
      ctx.reply(
        'Lütfen yandaki format ile bir email adresi giriniz. "/registerEmail example@gmail.com" '
      );
    }else if(isUser==='Invalid Username'){
      ctx.reply(
        'Lütfen önce bir telegram kullanıcı adı oluşturun. Telegram ayarlar kısmında "kullanıcı adı" üstüne basıp oluşturabilirsiniz.'
      );
    }
  });

  bot.command("registerEmail", async (ctx) => {
    const username = ctx.msg.from.username;
    let chatId = ctx.chat.id.toString();
    let msg = ctx.message.text;
    let msgArray = msg.split(" ");
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailFormat = emailRegex.test(msgArray[msgArray.length - 1]);
    if (emailFormat&&msgArray.length===2) {
      const addUser = await userControllers.createUser(
        username,
        chatId,
        msgArray[msgArray.length - 1]
      );
      if (addUser.username) {
        ctx.reply("Email Başarıyla Eklendi");

        ctx.reply(
          `${helpMessage}`
        );
      } else {
        ctx.reply("Zaten kayıtlısınız. Güncellemek isterseniz /email_guncelle komutunu kullanabilirsiniz.");

        ctx.reply(
          `${helpMessage}`
        );
      }
    } else {
      ctx.reply("Lütfen Emailinizi belirtilen şekilde doğru giriniz");
    }
  });

  bot.help((ctx) => {
    ctx.reply(
      `${helpMessage}`
    );
  });

  const userMailData = {};

  bot.command("domain_listele", async (ctx) => {
    var username = ctx.from.username;
    const listDomain = await domainControllers.listDomains(username);

    if (Array.isArray(listDomain)) {
      const message = listDomain.join("\n");
      let subject = `Domain Listeniz`;
      userMailData[username] = { subject, message };
      ctx.telegram.sendMessage(ctx.chat.id, `${subject}:\n${message}`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "E-mail Olarak Gönder",
                callback_data: `sendMail:`,
              },
            ],
          ],
        },
      });
    } else if (
      listDomain === "Kullanıcıya ait bir domain kaydı bulunmamaktadır"
    ) {
      ctx.reply(`Kayıtlı domain bulunmamaktadır`);
    } else {
      ctx.reply(
        `Sunucu tarafından hata oluştu. Listenizin kontrolü yapılamıyor.`
      );
    }
  });
  bot.action(/^sendMail:/, async (ctx) => {
    const username = ctx.from.username;
    var isUser = await userControllers.findUser(username);
    // console.log(isUser);
    const { subject, message } = userMailData[username] || {};
    await sendMail
      .sendMail(isUser.email, subject, message)
      .then((response) => {
        ctx.reply(`Mail Başarıyla Gönderildi`);
      })
      .catch((error) => {
        ctx.reply(`Mail Gönderilemedi.`);
      });
  });

  bot.command("domain_ekle", async (ctx) => {
    ctx.reply(
      'Lütfen istediğin alan adını "/addDomain example.com" şeklinde yazınız'
    );
  });

  bot.command("addDomain", async (ctx) => {
    const username = ctx.message.from.username;
    let msg = ctx.message.text;
    let msgArray = msg.split(" ");
    const domainRegex =/^(?!www\.|http:\/\/|https:\/\/)(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(?<!-)\.[A-Za-z]{2,}(\/[A-Za-z0-9-]+)*\/?$/;
    const domainFormat = domainRegex.test(msgArray[msgArray.length - 1]);
     
    if (domainFormat&&msgArray.length===2) {
      let addedDomain = await domainControllers.createDomain(
        username,
        msgArray[msgArray.length - 1]
      );
      if (addedDomain.id) {
        ctx.reply("Domain Başarıyla Eklendi.");
      } else if (addedDomain === "Bu domain bu kullanıcıya zaten eklenmiş") {
        ctx.reply("Bu domaini daha önce eklediniz");
      } else {
        ctx.reply("Domain eklenirken hata oluştu. Kayıt oluşturmadıysanız eğer lütfen önce kayıt oluşturun");
      }
     }else {
      ctx.reply("Lütfen istenilen formatta giriniz. ");
     }

    
  });

  bot.command("domain_sil", async (ctx) => {
    ctx.reply(
      'Lütfen istediğin alan adını "/delDomain example.com" şeklinde yazınız'
    );
  });

  bot.command("delDomain", async (ctx) => {
    const username = ctx.message.from.username;
    let msg = ctx.message.text;
    let msgArray = msg.split(" ");
    msgArray[msgArray.length - 1];

    const domainRegex =/^(?!www\.|http:\/\/|https:\/\/)(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(?<!-)\.[A-Za-z]{2,}(\/[A-Za-z0-9-]+)*\/?$/;
    const domainFormat = domainRegex.test(msgArray[msgArray.length - 1]);
     
    if (domainFormat&&msgArray.length===2) {
      let deletedDomain = await domainControllers.deleteDomain(
        username,
        msgArray[msgArray.length - 1]
      );
  
      if (deletedDomain.id) {
        ctx.reply("Domain Başarıyla silindi.");
      } else if (
        deletedDomain ===
        "Kullanıcıya ait bu alan adı ile bir domain kaydı bulunmamaktadır"
      ) {
        ctx.reply("Bu alan adında kaydınız bulunmamaktadır");
      } else {
        ctx.reply("Domain silinirken hata oluştu. Kayıt oluşturmadıysanız eğer lütfen önce kayıt oluşturun");
      }

    }else {
      ctx.reply("Lütfen istenilen formatta giriniz. ");
    }

   
  });

  bot.command("email_guncelle", async (ctx) => {
    ctx.reply(
      'Yeni email adresini örnekteki gibi giriniz. "/updateEmail example@gmail.com"'
    );
  });

  bot.command("updateEmail", async (ctx) => {
    const username = ctx.message.from.username;
    let msg = ctx.message.text;
    let msgArray = msg.split(" ");
    const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const emailFormat = emailRegex.test(msgArray[msgArray.length - 1]);
  if (emailFormat&&msgArray.length===2) {
let updateEmail = await userControllers.updateEmail(
      username,
      msgArray[msgArray.length - 1]
    );
    // console.log(updateEmail);
    if (updateEmail) {
      ctx.reply("Email Başarıyla Güncellendi.");
    } else {
      ctx.reply("Email güncellenirken hata oluştu");
    }
    
  }else {
    ctx.reply("Güncellenirken hata oluştu. Lütfen istenilen formatta giriniz ");
  }
    
  });
 
  bot.on('text', (ctx) => {
    ctx.reply(`Lütfen geçerli bir işlem seçin \n ${helpMessage}`);
});

  bot.launch();
};

module.exports = { telegramBot, sendMessage };
