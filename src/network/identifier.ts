import axios from "axios";

const identify = async () => {
    console.log(`[axios]`, "signing a public identifier.")
    const res = await axios("https://mongodb-rest.vercel.app/api/auth/signin/public/key").then(response => response.data);
    console.log(res);
    if (res.error.message !== "none") {
        throw new Error("[fetch] recieved error:" + res.error.message);
    } else {
        return res.bearer;
    }
}
export default identify;