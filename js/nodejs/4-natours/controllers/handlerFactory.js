const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// tworzymy funkcje ktora zwraca catch async
// i ten handler bedzie przekazany do routa
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

// tworzymy funkcje ktora zwraca funckje, ktora zwraca funkcje itp
// na konicu jest handler do funkcji
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError(`cant find ${req.params.id}`, 404)); //wazny jest retutn bo jak go zaponialem to kod poszedl dalej; return wychoszi z fumkxji
    }
    res.status(201).json({
      status: 'success',
      data: {
        date: document,
      },
    });
  });

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });
};

exports.getOne = (Model, popOtions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOtions) query = Model.findById(req.params.id).populate(popOtions);
    const document = await query;
    if (!document) {
      return next(new AppError(`cant find ${req.params.id}`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to jest tylko dla nested route reviews z zpiomu tours
    let nestedFilter = {};
    if (req.params.tourId) nestedFilter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(nestedFilter), req.query).filter().sort().limitFields().paginate();
    const document = await features.query; // to uruchamia zapytanie
    res.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        data: document,
      },
    });
  });
