export const wait = (waitForSec = 0.1) => new Promise<void>((resolve, rejects) => {
    try {
        setTimeout(() => {
            resolve();
        }, waitForSec * 1000);
    } catch (err) {
        rejects(err);
    }
    return
});