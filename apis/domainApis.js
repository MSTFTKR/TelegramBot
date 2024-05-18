const prisma = require("../DB/prisma");


const domainHistory = async (req, res) => {
  const{page_index,page_size}=req.body.data
try {
  const totalChecks = await prisma.checks.count()
  const domainHistoryContent = await prisma.checks.findMany({
    orderBy: { id: "desc" },
    skip: page_size*page_index,
    take: page_size,
  });
  let response={
    page_index: page_index,
    page_size: page_size,
    count: totalChecks,
    items: domainHistoryContent
  }

    res.json(response)
} catch (error) {
  res.status(500).json({ message: error.message });
}

  
};
module.exports={domainHistory}
