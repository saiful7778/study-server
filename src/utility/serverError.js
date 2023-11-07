function serverError(tryCode, res) {
  try {
    tryCode();
  } catch (err) {
    res.status(500).send({
      error: "An error occurred",
    });
  }
}

module.exports = serverError;
