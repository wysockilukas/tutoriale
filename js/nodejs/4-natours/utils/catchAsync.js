module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //next jest funkcja wiec taki zapis jest dopuszcalny
  };
};
