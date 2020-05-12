import { Tracking } from './';
describe('Russian Post tracking API', () => {
  it('return tracking history', async () => {
    const tracking = new Tracking({ language: 'ENG' });
    expect(await tracking.getHistory('RS253346199NL')).toMatchSnapshot();
  }, 30000);
});
