const prisma = require("../DB/prisma");

const findUser = async (userName) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        username: userName,
      },
    });
    return user
  } catch (error) {
    return 'Invalid Username'
  }
};

const createUser = async (username, chatId, email) => {
  
  if (!username || !email || !chatId) {
    return "Invalid request"
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
      return newUser
    } else {
      throw new Error("Bu username ile zaten bir kullanıcı bulunmaktadır");
    }
  } catch (error) {
    return error.message
  }
};
const updateEmail = async (userName, eMail) => {
  
  if (!userName || !eMail) {
    return  "Invalid request"
  }

  try {
    const updateUser = await prisma.users.update({
      where: { username: userName },
      data: {
        username: userName,
        email: eMail,
      },
    });
    return updateUser
  } catch (error) {
    return error.message
  }
};

module.exports = { createUser, updateEmail, findUser };
