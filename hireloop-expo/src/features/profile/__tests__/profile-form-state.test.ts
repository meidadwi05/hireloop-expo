import {formValuesEqual, hasFormChanges} from '../profile-form-state';

describe('profile form state', () => {
  it('ignores surrounding whitespace and object key order', () => {
    expect(formValuesEqual(
      {name: ' Zaki ', address: {city: 'Jakarta', postalCode: '12345'}},
      {address: {postalCode: '12345', city: 'Jakarta'}, name: 'Zaki'},
    )).toBe(true);
  });

  it('detects nested field changes', () => {
    expect(hasFormChanges(
      {name: 'Zaki', address: {city: 'Jakarta'}},
      {name: 'Zaki', address: {city: 'Bandung'}},
    )).toBe(true);
  });

  it('detects array changes', () => {
    expect(hasFormChanges({roles: [1, 2]}, {roles: [1, 3]})).toBe(true);
  });
});
