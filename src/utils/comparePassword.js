const bcrypt = require("bcrypt")

const comparePassword = async function(inputPassword, storedPassword){
    return await bcrypt.compare(inputPassword, storedPassword);
}

module.exports = comparePassword;