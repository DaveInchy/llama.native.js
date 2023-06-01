const sanitize = (exp: string) => `\/${exp}\/`;

export default ({
    isEmailDomain: (domain: string) => new RegExp(sanitize(`(\S+)(@)(${domain})`)),
    isEmail: new RegExp(sanitize(`(\S+)(.)(@)(.+)\.(.*)`))
});