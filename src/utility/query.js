function getQuery(listData, queryData) {
  const remain = listData.find((ele) => ele.userUid === queryData);
  return remain;
}

module.exports = getQuery;
