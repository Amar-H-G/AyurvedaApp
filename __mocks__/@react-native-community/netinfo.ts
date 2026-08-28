/**
 * NetInfo mock for Jest tests.
 */
const NetInfo = {
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
  })),
};

export default NetInfo;
