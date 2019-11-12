import React from 'react';

const byId = (data) => {
  return data.reduce((obj, item) => {
    obj[item.id] = item
    return obj
  }, {});
};

const findByIdAndReplace = (array, object) => {
  return array.map(c => {
    return c.id == object.id ? object : c;
  });
}

export { byId, findByIdAndReplace };