const sanitize = (exp) => `\/${exp}\/`;
const expressions = ({
    emailWithDomain: (domain) => new RegExp(sanitize(`(\S+)(@)(${domain})`)),
    regEmail: new RegExp(sanitize(`(\S+)(.)(@)(.+)\.(.*)`))
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXhwLmpzIiwic291cmNlUm9vdCI6Ii4vc3JjLyIsInNvdXJjZXMiOlsibGliL3JlZ2V4cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUMvQyxNQUFNLFdBQVcsR0FBRyxDQUFDO0lBQ2pCLGVBQWUsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNoRixRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Q0FDMUQsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc2FuaXRpemUgPSAoZXhwOiBzdHJpbmcpID0+IGBcXC8ke2V4cH1cXC9gO1xyXG5jb25zdCBleHByZXNzaW9ucyA9ICh7XHJcbiAgICBlbWFpbFdpdGhEb21haW46IChkb21haW46IHN0cmluZykgPT4gbmV3IFJlZ0V4cChzYW5pdGl6ZShgKFxcUyspKEApKCR7ZG9tYWlufSlgKSksXHJcbiAgICByZWdFbWFpbDogbmV3IFJlZ0V4cChzYW5pdGl6ZShgKFxcUyspKC4pKEApKC4rKVxcLiguKilgKSlcclxufSk7Il19