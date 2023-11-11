function getQuery(listData, queryData) {
  const remain = listData.find((ele) => ele.userUid === queryData);
  return remain;
}

function getConditionQuery(listData, queryData) {
  const remain = listData.filter(
    (ele) => ele.submittedData.status === queryData
  );
  return remain;
}

module.exports = { getQuery, getConditionQuery };
