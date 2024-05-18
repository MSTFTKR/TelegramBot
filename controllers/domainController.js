const prisma = require("../DB/prisma");


const createDomain = async (username,domain_name) => {

  if (!username || !domain_name ) {
    return  "Invalid request"
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
        // console.log(newDomain, "eklendi");
      } catch (error) {
        return error.message
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
        return newUserDomainRelation
      } catch (error) {
        return error.message
      }
    } else {
      throw new Error("Bu domain bu kullanıcıya zaten eklenmiş");
    }
  } catch (error) {
    return error.message
  }
};

const deleteDomain = async ( userName,domainName) => {
  if (!userName || !domainName ) {
    return  "Invalid request" 
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
        await prisma.checks.deleteMany({
          where: {
            domain_name:domainName
          },
        });
        const deleteDomain = await prisma.domains.delete({
          where: { domain_name:domainName },
        });
        // console.log(deleteDomain,'silindi')
      }

      return deleteData
    }
    
  } catch (error) {
    return error.message
  }
};

const listDomains = async (userName) => {
  if (!userName ) {
    return  "Invalid request"
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
  return domainNames
  } catch (error) {
    return error.message
  }

}

const listUsers = async (domainName) => {
  
  if (!domainName ) {
    return "Invalid request" 
  }

  try {
    const domainUsers = await prisma.userDomains.findMany({
    where: {
      domain_name:{equals:domainName},
    }
  });

if(domainUsers.length<1){
  throw new Error('Bu domaine ait kullanıcı bulunamadı')
}

const userNames = domainUsers.map(item => item.username);
return userNames
} catch (error) {
  return error.message
}
}

const allListDomains = async (req, res) => {

  try {
    const Domains = await prisma.domains.findMany()
    const listDomains = Domains.map(item => item.domain_name);
return listDomains
  } catch (error) {
    return error.message
  }

}
module.exports = { createDomain, deleteDomain, listDomains, allListDomains,listUsers };
