export interface Bookmark {
  confidence: number;
  coordinates: {
    coordinate_degrees: string;
    latitude_degrees: string;
    longitude_degrees: string;
    coordinate_DMS: string;
    latitude_DMS: string;
    longitude_DMS: string;
  };
  currency: {
    currency_representation: string;
    currency_abbreviation: string;
    currency_name: string;
  };
  location: {
    continent: string;
    country: string;
    region: string;
    state: string;
    state_code: string;
    state_district: string;
    municipality: string;
    city_district: string;
    city: string;
    town: string;
    suburb: string;
    road: string;
    postcode: string;
    formatted: string;
    hamlet: string;
    neighbourhood: string;
    quarter: string;
    city_block: string;
    county: string;
  };
  time: {
    timezone: string;
    offset: string;
    abbreviation: string;
  };
  flag: string;
  two_letter_cc: string;
  three_letter_cc: string;
  calling_code: number;
  streetview: {
    google: {
      before_id: string,
      id: string,
      after_id: string,
      street_pitch: string,
      thumbnail_pitch: string,
      yaw: string,
      fov: string
    }
  }
}

export interface Route {
  id: number;
  title: string;
  route: string;
}