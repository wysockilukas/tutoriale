class APIFeatures {
  constructor(query, queryString) {
    // queryString to nasze req.query
    // query to obiekt mongoosa - query
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Budujemy zapytanie
    let queryObj = { ...this.queryString };
    const excludedFileds = ['page', 'sort', 'limit', 'fields'];
    excludedFileds.forEach((el) => delete queryObj[el]);

    // 1B) Zaawansowane filtrowanie
    const queryStr = JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryStr);
    this.query.find(queryObj);
    return this; //dzieki temu dziala chain, bo zwracamy caly obiekt ktory ma np metode sort itd
  }

  sort() {
    if (this.queryString.sort) {
      this.query.sort(this.queryString.sort.split(',').join(' '));
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query.select(this.queryString.fields.split(',').join(' '));
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
