const prisma = require("../DB/prisma");


const createDomain = async (req, res) => {
  const { username, domain_name } = req.body.data;
  if (!username || !domain_name ) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const domain = await prisma.domains.findUnique({
      where: {
        domain_name: domain_name,
      },
    });

    if (!domain) {
      try {
        const newDomain = await prisma.domains.create({
          data: {
            domain_name: domain_name,
          },
        });
        console.log(newDomain, "eklendi");
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }

    const userDomain = await prisma.userDomains.findFirst({
      where: {
        username: username,
        domain_name: domain_name,
      },
    });

    if (!userDomain) {
      try {
        const newUserDomainRelation = await prisma.userDomains.create({
          data: {
            username: username,
            domain_name: domain_name,
          },
        });
        res.json(newUserDomainRelation);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else {
      throw new Error("Bu domain bu kullanıcıya zaten eklenmiş");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDomain = async (req, res) => {
  const { domainName,userName } = req.query;
  if (!userName || !domainName ) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
      

    const domain = await prisma.userDomains.findFirst({
      where: {
        username:userName,
        domain_name: domainName
      }
    });
 
    if(!domain){
      throw new Error('Kullanıcıya ait bu alan adı ile bir domain kaydı bulunmamaktadır')
    }
    else{
      const deleteData = await prisma.userDomains.delete({
        where: { id: Number(domain.id) },
      });
      const isDomain = await prisma.userDomains.findFirst({
        where: {
          domain_name: domainName
        }
      });
      if(!isDomain){
        const deleteDomain = await prisma.domains.delete({
          where: { domain_name:domainName },
        });
        console.log(deleteDomain,'silindi')
      }

      res.json(deleteData);
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listDomains = async (req, res) => {
  const { userName } = req.query;
  if (!userName ) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const userDomains = await prisma.userDomains.findMany({
    where: {
      username:{equals:userName},
    }
  });
  
  if(userDomains.length<1){
    throw new Error('Kullanıcıya ait bir domain kaydı bulunmamaktadır')
  }
  
  const domainNames = userDomains.map(item => item.domain_name);
res.json(domainNames)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}


const allListDomains = async (req, res) => {

  try {
    const Domains = await prisma.domains.findMany()
    const listDomains = Domains.map(item => item.domain_name);
res.json(listDomains)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}
module.exports = { createDomain, deleteDomain, listDomains, allListDomains };
