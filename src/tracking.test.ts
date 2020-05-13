import { Tracking } from './';
describe('Russian Post tracking API', () => {
  it('return tracking history', async () => {
    const tracking = new Tracking({ language: 'ENG' });
    expect(await tracking.getHistory('RA644000001RU')).toMatchSnapshot();
  }, 30000);

  it('handles data format errors', async () => {
    const tracking = new Tracking({ language: 'ENG' });
    await expect(tracking.getHistory('byakabuka')).rejects.toHaveProperty(
      'message',
      'The format of the request data is invalid',
    );
  }, 30000);

  it('handles unknown tracking', async () => {
    const tracking = new Tracking({ language: 'ENG' });
    await expect(tracking.getHistory('RA999999999RU')).rejects.toHaveProperty(
      'message',
      expect.stringMatching(
        /^Unable to find operations history for tracking code/,
      ),
    );
  }, 30000);
});
