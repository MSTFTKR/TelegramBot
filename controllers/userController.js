const prisma = require("../DB/prisma");

const findUser = async (req, res) => {
  const { userName } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: {
        username: userName,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const { username, email, chatId } = req.body.data;
  if (!username || !email || !chatId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      const newUser = await prisma.users.create({
        data: {   
          username: username,
          chatId: chatId,
          email: email,
        },
      });
      res.json(newUser);
    } else {
      throw new Error("Bu username ile zaten bir kullanıcı bulunmaktadır");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateEmail = async (req, res) => {
  const { userName, eMail } = req.query;
  if (!userName || !eMail) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const updateUser = await prisma.users.update({
      where: { username: userName },
      data: {
        username: userName,
        email: eMail,
      },
    });
    res.json(updateUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, updateEmail, findUser };
