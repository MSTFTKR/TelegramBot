const prisma = require("../DB/prisma");

const createCheck = async (domain_name, status_code) => {
  if (!domain_name || !status_code) {
    return "Invalid Request";
  }
  try {
    const isDomain = await prisma.domains.findUnique({
      where: {
        domain_name: domain_name,
      },
    });

    if (isDomain) {
      const newCheck = await prisma.checks.create({
        data: {
          domain_name: domain_name,
          status_code: status_code,
        },
      });
      return newCheck;
    } else {
      throw new Error("Domain bulunamadı");
    }
  } catch (error) {
    return error.message;
  }
};
const latestcheck = async (domainName) => {
  if (!domainName) {
    return "Invalid request";
  }

  try {
    const lastcheck = await prisma.checks.findFirst({
      where: {
        domain_name: domainName, // Kullanıcının kimliğine göre sorgulama yapın
      },
      orderBy: {
        timestamp: "desc", // Tarihe göre azalan sırada sıralama yapın
      },
    });
    if (lastcheck) {
      return lastcheck;
    } else {
      return "null";
    }
  } catch (error) {
    return error.message;
  }
};

module.exports = { createCheck, latestcheck };
