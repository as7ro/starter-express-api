import User from "../models/userModel.js"

export const getUser = async (language,role) => {

  const query = {};
  if (role) {
    query.role = role;
  }
  const users = await User.find(query);
  let mappepUsers = [];

  switch (language) {
    case 'az':
        mappepUsers = users.map(users => ({
        ...users.toObject(),
        description: users.descriptionAz
      }));
      break;
    case 'de':
        mappepUsers = users.map(users => ({
        ...users.toObject(),
      
        description: users.descriptionGe
      }));
      break;
    default:
        mappepUsers = users.map(users => ({
        ...users.toObject(),
     
        description: users.descriptionAz
      }));
      break;
  }

  return mappepUsers;
};

