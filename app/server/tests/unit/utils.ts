export const mockResponse = () => {
    const res: any = {};
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

export const mockRedis = {};
export const mockApp = {
    locals: {
        redis: mockRedis
    }
};