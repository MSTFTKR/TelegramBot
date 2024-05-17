const prisma = require("../DB/prisma");

const createCheck = async (req, res) => {
  const { domain_name, status_code, timestamp } = req.body.data;
  if (!domain_name || !status_code) {
    return res.status(400).json({ message: "Invalid Request" });
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
          timestamp:timestamp,
        },
      });
      res.json(newCheck);
    } else {
      throw new Error("Domain bulunamadı");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const latestcheck = async (req, res) => {
  const { domainName } = req.query;
  if (!domainName ) {
    return res.status(400).json({ message: "Invalid request" });
  }


  try {
    const lastcheck = await prisma.checks.findFirst({
    where: {
      domain_name: domainName, // Kullanıcının kimliğine göre sorgulama yapın
    },
    orderBy: {
      timestamp: 'desc', // Tarihe göre azalan sırada sıralama yapın
    }
})
if(lastcheck){
  res.json(lastcheck)
}else res.json('null')
 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  ;}



module.exports = { createCheck,latestcheck };
