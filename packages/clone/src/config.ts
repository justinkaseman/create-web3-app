const findUp = require("find-up");

export const getConfig = async (name) => {
  return await findUp(name);
};

export const loadConfig = async (path) => {
  try {
    const file = require(path);
    return file;
  } catch (e) {
    console.log("err", e);
    return false;
  }
};
