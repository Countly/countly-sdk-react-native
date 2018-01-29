module.exports = {
    "extends": "airbnb",
    "env": {
        "browser": true
    },
    "parser": "babel-eslint",
    "rules": {
        "react/jsx-filename-extension": ["error", { "extensions": [".js", ".jsx"] }],
        "react/sort-comp": [0],
        "no-underscore-dangle": ["error", { "allow": ["_locale"] }],
        "jsx-quotes": ["error", "prefer-single"],
        "no-bitwise": ["error", { "allow": ["|", "&"] }],
    }
};