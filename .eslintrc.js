module.exports = {
    "extends": "airbnb",
    "env": {
        "browser": true
    },
    "parser": "babel-eslint",
    "rules": {
        "react/jsx-filename-extension": ["error", { "extensions": [".js", ".jsx"] }],
        "react/sort-comp": [0],
        "no-underscore-dangle": ["error", { "allow": ["_locale", "_ram_current", "_custom"] }],
        "jsx-quotes": ["error", "prefer-single"],
        "no-bitwise": ["error", { "allow": ["|", "&"] }],
    }
};