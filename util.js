import { AsyncStorage } from 'react-native';
import SHA256 from 'crypto-js/sha256';
import pinch from 'react-native-pinch';
import Countly from './Countly';

export const createHash = data => SHA256(data).toString().toUpperCase();

export const Ajax = {
  /**
   * @description returns query for URL
   * @param data contains parameter to be passed in URL
   */
  query: (data, secretSalt = null) => {
    let queryString = '';
    queryString += 'test=none&';
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'object') {
        queryString += `${key}=${encodeURIComponent(JSON.stringify(data[key]))}&`;
      } else {
        queryString += `${key}=${encodeURIComponent(data[key])}&`;
      }
    });
    if (secretSalt) {
      queryString += `&checksum256=${encodeURIComponent(createHash(`${queryString}${secretSalt}`))}`;
    }
    return queryString;
  },

  /**
   * @description generates uuid
   */
  generateUUID: () => {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (d + (Math.random() * 16)) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
    return uuid;
  },

  // return current time
  getTime: () => new Date().getTime(),

  // returns hour of the passed time
  getHour: data => new Date(data).getHours(),

  // returns Day of the week
  getDay: data => new Date(data).getDay(),

  // returns time zone of the user
  getTimeZone: data => new Date(data).getTimezoneOffset(),

  // returns time difference from current-time and parameter-time
  reportViewDuration: (date) => {
    const now = new Date().getTime();
    const diff = now - date;
    return diff;
  },

  /**
   * @description fetch data using GET method
   * @param {*} url api-end-point
   * @param {*} data parameters to be passed in URL
   * @param {*} callback function invoked after the fetch success or error
   */
  get: (newURL, newData, callback) => (
    fetch(newURL).then(response => response.json()).then((responseJson) => {
      callback(responseJson);
    }).catch((error) => {
      callback(error);
    })
  ),

  /**
   * @description fetch data using POST method
   * @param {*} url api-end-point
   * @param {*} data parameter to be send
   * @param {*} callback function called after the fetch success or error
   */
  post: (newURL, newData, callback) => (
    fetch(newURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...newData }),
    }).then((responseJson) => {
      callback(responseJson);
    }).catch((error) => {
      callback(error);
    })
  ),

  /**
   * @description get the value of the key from localStorage
   * @param {*} key key whose value to be fetched
   * @param {*} callback function execute after the item is fetched successfully
   */
  getItem: (key, callback) => {
    try {
      AsyncStorage.getItem(`Countly:${key}`, (err, result) => {
        callback(err, result);
      });
    } catch (error) {
      // Countly.log('Error while getting', key);
      return null;
    }
    return null;
  },

  /**
   * @description store the value with key in local Storage
   * @param {*} key key for the data to be store
   * @param {*} value value of the data
   * @param {*} callback function execute after the object is successfully saved
   */
  setItem: (key, value, callback) => {
    try {
      AsyncStorage.setItem(`Countly:${key}`, value, (result) => {
        if (callback) {
          callback(result);
        }
      });
    } catch (error) {
      // Countly.log('Error while storing', key, value);
    }
  },

  /**
   * @description fetch data using certificate pinning
   * @param {*} key key for the data to be store
   * @param {*} value value of the data
   * @param {*} callback function execute after the object is successfully saved
   */
  sslCertificateRequest: (newURL, newData, certificateName,callback) => (
    pinch.fetch(newURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...newData }),
      sslPinning: {
        cert: certificateName, // cert file name without the `.cer`
      }
    }).then((responseJson) => {
      callback(responseJson);
    }).catch((error) => {
      callback(error);
    })
  ),
};

export const userData = {
  setProperty: (keyName, keyValue) => {
    const update = {};
    update[keyName] = keyValue;
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userDataProperty', result); });
  },

  increment: (keyName) => {
    const update = {};
    update[keyName] = {
      $inc: 1,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.increment', result); });
  },

  incrementBy: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $inc: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.incrementBy', result); });
  },

  multiply: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $mul: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.multiply', result); });
  },

  saveMax: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $max: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.saveMax', result); });
  },

  saveMin: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $min: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.saveMin', result); });
  },

  setOnce: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $setOnce: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.setOnce', result); });
  },

  pullValue: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $pull: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.pullValue', result); });
  },

  pushValue: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $push: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.pushValue', result); });
  },

  // Set the newValue of the userData with specific key
  addToSetValue: (keyName, keyValue) => {
    const update = {};
    update[keyName] = {
      $addToSet: keyValue,
    };
    Countly.get('/i', {
      user_details: {
        custom: update,
      },
    }, (result) => { Countly.log('userData.addToSetValue', result); });
  },
};
