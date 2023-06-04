// used to await timeout after microseconds
export const waitFor = (ms: number = 100) => new Promise<void>((resolve, rejects) => {
    try {
        setTimeout(() => {
            resolve();
        }, ms);
    } catch (err) {
        rejects(err);
    }
    return;
});

