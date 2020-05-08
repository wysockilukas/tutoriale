// ten middleware przyjmuje atrybu err co oznacza ze bedzie wykonay jak bedze blad
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
  });
};
