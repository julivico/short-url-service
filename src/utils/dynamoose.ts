const dynamoose = require("dynamoose");

// Set default prefix for using dev environment as default
dynamoose.model.defaults.set({
    "prefix": "DEV"
});

export default dynamoose;
