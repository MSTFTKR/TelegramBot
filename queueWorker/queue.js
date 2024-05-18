const { Worker, Queue } = require("bullmq");

const checkControllers = require("../controllers/checkController");
const domainControllers = require("../controllers/domainController");
const userControllers = require("../controllers/userController");
const moment = require("moment");

const telegram = require("../telegramBot/telegramBot");
const axios = require("axios");
const cron = require("node-cron");

const queueProcess = async () => {

  const queue = new Queue("domainQuery", {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  });

  cron.schedule("*/15 8-22 * * *", async () => {
    // await queue.obliterate();
    
    domains = await domainControllers.allListDomains();
    domains.forEach((domain) => {   

      let repDomain = domain.replace(/[^a-zA-Z0-9]/g, "");
      queue.add(
        "domainQuery",
        { domain },
        {
          jobId: repDomain,
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    });
  });

  cron.schedule("*/30 23-23,0-7 * * *", async () => {
    // await queue.obliterate();

    domains = await domainControllers.allListDomains();
    domains.forEach((domain) => {
      let repDomain = domain.replace(/[^a-zA-Z0-9]/g, "");
      queue.add(
        "domainQuery",
        { domain },
        {
          jobId: repDomain,
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    });
  });

  const worker = new Worker(
    "domainQuery",
    async (job) => {
      const { domain } = job.data;
      domainGenerate = "http://" + domain;
      try {
        const response = await axios.get(domainGenerate);
    
        if (response.status) {
            
          const latestCheck = await checkControllers.latestcheck(domain);
          // console.log(domain)
          if (latestCheck.status_code >= 400) {
        
            const startDate = moment(latestCheck.timestamp);
            const endDate = moment();
            const difference = moment.duration(endDate.diff(startDate));
            const days = difference.days();
            const hours = difference.hours();
            const minutes = difference.minutes();
            let messageContent;
            if (days > 0) {
              messageContent = `${domain}, ${days}Gün, ${hours}Saat, ${minutes} Dakikadır Kapalıydı. Şimdi Tekrar Açıldı`;
            } else if (hours > 0) {
              messageContent = `${domain}, ${hours}Saat, ${minutes} Dakikadır Kapalıydı. Şimdi Tekrar Açıldı`;
            } else {
              messageContent = `${domain}, ${minutes} Dakikadır Kapalıydı. Şimdi Tekrar Açıldı`;
            }

            const listUser = await domainControllers.listUsers(domain);

            if (Array.isArray(listUser)) {
              let subject = "Domain Up";
              listUser.forEach(async (user) => {
                const userInfo = await userControllers.findUser(user);
                await telegram.sendMessage(
                  userInfo.username,
                  userInfo.chatId,
                  subject,
                  messageContent
                );
              });
            }
          }
          
          let statusCode=response.status.toString();
          
          const addStatus = await checkControllers.createCheck(
            domain,
            statusCode
          );
        //   console.log(addStatus);
        }
      } catch (error) {
       
        if (
          error.response &&
          error.response.status >= 300 &&
          error.response.status < 400
        ) {
          const latestCheck = await checkControllers.latestcheck(domain);
          // console.log(domain)
          if (latestCheck.status_code >= 400) {
        
            const startDate = moment(latestCheck.timestamp);
            const endDate = moment();
            const difference = moment.duration(endDate.diff(startDate));
            const days = difference.days();
            const hours = difference.hours();
            const minutes = difference.minutes();
            let messageContent;
            if (days > 0) {
              messageContent = `${domain}, ${days}Gün, ${hours}Saat, ${minutes} Dakikadır Kapalıydı. Şimdi Tekrar Açıldı`;
            } else if (hours > 0) {
              messageContent = `${domain}, ${hours}Saat, ${minutes} Dakikadır Kapalıydı. Şimdi Tekrar Açıldı`;
            } else {
              messageContent = `${domain}, ${minutes} Dakikadır Kapalıydı. Şimdi Tekrar Açıldı`;
            }

            const listUser = await domainControllers.listUsers(domain);

            if (Array.isArray(listUser)) {
              let subject = "Domain Up";
              listUser.forEach(async (user) => {
                const userInfo = await userControllers.findUser(user);
                await telegram.sendMessage(
                  userInfo.username,
                  userInfo.chatId,
                  subject,
                  messageContent
                );
              });
            }
          }
          
          let statusCode=response.status.toString();
          
          const addStatus = await checkControllers.createCheck(
            domain,
            statusCode
          );
        } else {
          
          if (error.response && error.response.status) {
            
            const latestCheck = await checkControllers.latestcheck(domain);
            
            if (latestCheck==='null' || latestCheck.status_code < 400) {
              let statusCode=error.response.status.toString();
              if (latestCheck) {
                await checkControllers.createCheck(domain, statusCode);
              } else {
                await checkControllers.createCheck(domain, statusCode);
              }
            }

            throw new Error();
          } else {
            const latestCheck = await checkControllers.latestcheck(domain);
            // console.log(latestCheck)
            if (latestCheck.status_code < 400 || latestCheck==='null') {
    
              await checkControllers.createCheck(domain, "500");
            }

            throw new Error();
            
          }
        }
      }
    },
    {
      connection: {
        host: "127.0.0.1",
        port: 6379,
      },
    }
  );

  worker.on("failed", async (job) => {
    const { domain } = job.data;
    let { closedDuration } = job.data;
    let domains = await domainControllers.allListDomains();
    const repDomain = domain.replace(/[^a-zA-Z0-9]/g, "");
    if (domains.includes(domain)) {
      // console.log(`${domain} siteye ulaşılamıyor`);

      const listUser = await domainControllers.listUsers(domain);
      const latestCheck = await checkControllers.latestcheck(domain);

      if (latestCheck.status_code >= 400) {
        const startDate = moment(latestCheck.timestamp);
        const endDate = moment();
        const difference = moment.duration(endDate.diff(startDate));
        const hours = Math.floor(difference.asHours());
        
        if (closedDuration) {
            closedDuration=parseInt(closedDuration)
          if (hours > closedDuration) {
            // console.log(domain)
            let closedDuration = hours.toString();
            let subject = `Domain Down Time`;
            let message = `${domain}, ${hours} saattir kapalıı`;
            
            if (Array.isArray(listUser)) {
              listUser.forEach(async (user) => {
                const userInfo = await userControllers.findUser(user);
                await telegram.sendMessage(
                  userInfo.username,
                  userInfo.chatId,
                  subject,
                  message
                );
              });
            }
            
            await queue.add(
              "domainQuery",
              { domain, closedDuration },
              {
                delay: 60000,
                jobId: repDomain,
                removeOnComplete: true,
                removeOnFail: true,
              }
            );
          } else {
            closedDuration = hours.toString();
            // console.log(domain)
            await queue.add(
              "domainQuery",
              { domain, closedDuration },
              {
                delay: 60000,
                jobId: repDomain,
                removeOnComplete: true,
                removeOnFail: true,
              }
            );
          }
        } else {
          
          if (hours > 0) {
            closedDuration = hours.toString();
            
            let subject = `Domain Down Time`;
            let message = `${domain}, ${hours} saattir kapalı`;
       
            if (Array.isArray(listUser)) {
              listUser.forEach(async (user) => {
                const userInfo = await userControllers.findUser(user);
                await telegram.sendMessage(
                  userInfo.username,
                  userInfo.chatId,
                  subject,
                  message
                );
              });
            }

            await queue.add(
              "domainQuery",
              { domain, closedDuration },
              {
                delay: 60000,
                jobId: repDomain,
                removeOnComplete: true,
                removeOnFail: true,
              }
            );
          } else {
            let subject = `Domain Down`;
            let message = `${domain}, Down`;
            // console.log(message)
            if (Array.isArray(listUser)) {
              listUser.forEach(async (user) => {
                const userInfo = await userControllers.findUser(user);
                await telegram.sendMessage(
                  userInfo.username,
                  userInfo.chatId,
                  subject,
                  message
                );
              });
            }
            
            closedDuration = hours.toString();
           await queue.add(
              "domainQuery",
              { domain, closedDuration},
              {
                delay: 60000,
                jobId: repDomain,
                removeOnComplete: true,
                removeOnFail: true,
              }
            );
          }
        }
      }
    }
  });
  worker.on("completed", async (job) => {});
};

module.exports = { queueProcess };
