export const waitFor = (ms = 100) => new Promise((resolve, rejects) => {
    try {
        setTimeout(() => {
            resolve();
        }, ms);
    }
    catch (err) {
        rejects(err);
    }
    return;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290Ijoic3JjLyIsInNvdXJjZXMiOlsibGliL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxDQUFDLEtBQWEsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtJQUNoRixJQUFJO1FBQ0EsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ1Y7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNoQjtJQUNELE9BQU87QUFDWCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHVzZWQgdG8gYXdhaXQgdGltZW91dCBhZnRlciBtaWNyb3NlY29uZHNcclxuZXhwb3J0IGNvbnN0IHdhaXRGb3IgPSAobXM6IG51bWJlciA9IDEwMCkgPT4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdHMpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBtcyk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICByZWplY3RzKGVycik7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbn0pO1xyXG5cclxuIl19