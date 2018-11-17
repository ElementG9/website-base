const db = `website-base`;
const connString = `mongodb+srv://ElementG9:GuaranT9!@cluster0-yv558.mongodb.net/test?retryWrites=true`;
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

const UserModel = mongoose.model("User", mongoose.Schema({
    UUID: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}));

var userCtl = {
    createUUID: function (len) {
        var load = new Promise((resolve, reject) => {
            var UUID = "";
            var alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (var i = 0; i < len; i++) {
                var char = alphanumeric[Math.round(Math.random() * alphanumeric.length)];
                UUID = UUID.concat(char);
            }
            mongoose.connect(connString, null)
                .then(() => {
                    UserModel.find({
                        "UUID": UUID
                    }, (err, docs) => {
                        if (err) reject(err); // if err reject
                        if (typeof docs[0] != "undefined") {
                            createUUID(len); // if not unique, regenerate uuid
                        } else {
                            resolve(UUID);
                        }
                    });
                }).catch((err) => {
                    reject(err);
                });
        });
        return load;
    },
    authUser: function (username, password) {
        var load = new Promise((resolve, reject) => {
            mongoose.connect(connString, null)
                .then(() => {
                    userCtl.getUser(username).then((doc) => {
                        var dbpass = doc.password;
                        if (bcrypt.compareSync(password, dbpass)) {
                            userCtl.getUser(username)
                                .then((user) => {
                                    resolve(user);
                                });
                        } else {
                            reject();
                        }
                    });
                })
                .catch((err) => {
                    reject(err);
                    throw err;
                });
        });
        return load;
    },
    createUser: function (username, password) {
        var load = new Promise((resolve, reject) => {
            mongoose.connect(connString, null)
                .then(() => {
                    userCtl.createUUID(6)
                        .then((UUID) => {
                            var usr = new UserModel({
                                username: username,
                                password: bcrypt.hashSync(password, 10),
                                UUID: UUID
                            });
                            usr.save();
                            resolve(usr);
                        });
                })
                .catch((err) => {
                    reject(err);
                    throw err;
                });
        });
        return load;
    },
    getUser: function (username) {
        var load = new Promise((resolve, reject) => {
            mongoose.connect(connString, null)
                .then(() => {
                    UserModel.findOne({
                        username: username
                    }, (err, doc) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(doc);
                        }
                    })
                })
                .catch((err) => {
                    reject(err);
                    throw err;
                });
        });
        return load;
    },
    updateUser: function (username, options) {
        var load = new Promise((resolve, reject) => {
            mongoose.connect(connString, null)
                .then(() => {
                    UserModel.findOne({
                        username: username
                    }, (err, doc) => {
                        if (err) throw err;
                        if (options.username) {
                            doc.username = options.username;
                            doc.save();
                            resolve();
                        } else if (options.password) {
                            doc.password = bcrypt.hashSync(options.password, 10);
                            doc.save();
                            resolve();
                        } else if (options.addPost) {
                            doc.posts.push(options.addPost);
                            doc.save();
                            resolve();
                        } else {
                            reject();
                        }
                    });
                })
                .catch((err) => {
                    reject(err);
                    throw err;
                });
        });
        return load;
    },
    deleteUser: function (username) {
        var load = new Promise((resolve, reject) => {
            mongoose.connect(connString, null)
                .then(() => {
                    UserModel.findOneAndRemove({
                            username: username
                        })
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                })
                .catch((err) => {
                    reject(err);
                    throw err;
                });
        });
        return load;
    }
};

module.exports = {
    user: userCtl
};
