import * as _ from 'lodash';

import Cursor from './Cursor';

export default class KrakenTokenCursor extends Cursor {
  constructor(kraken, endpoint, digPath, parameters) {
    super(endpoint, { limit: 25 }, parameters);
    this._kraken = kraken;
    this._digPath = digPath;

    this._cursor = null;
  }

  async next() {
    if (this._error) {
      throw this._error;
    }

    const params = _.merge({}, this._parameters);

    if (this._started) {
      // a null offset, after starting, means that we've run out of values.
      if (this._cursor) {
        params.cursor = this._cursor;
      } else {
        return null;
      }
    }

    this._started = true;

    try {
      const resp = await this._kraken.get(this._endpoint, { params });
      const {data} = resp;

      this._cursor = data._cursor;
      this._total = data.total;
      this._data = _.get(data, this._digPath);

      return this._data;
    } catch (err) {
      this._error = err;
      throw err;
    }
  }
}