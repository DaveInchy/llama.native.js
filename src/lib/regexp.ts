const sanitize = (exp: string) => `\/${exp}\/`;
const expressions = ({
    emailWithDomain: (domain: string) => new RegExp(sanitize(`(\S+)(@)(${domain})`)),
    regEmail: new RegExp(sanitize(`(\S+)(.)(@)(.+)\.(.*)`))
});