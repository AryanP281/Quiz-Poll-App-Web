
/*****************************Imports********************/

/*****************************Variables********************/
const emailRegex = /[\w]+['@'][a-zA-z]{2,}['.'][a-z]{2,3}/g; //The regex for checking if the email is valid

/*****************************Functions********************/
function getCookies()
{
    /*Returns an object containing the set cookies*/

    if(document.cookie.length === 0)
        return new Map();

    const cookieStrs = document.cookie.split(';'); //Getting cookies list

    const cookies = new Map();
    let cookieComps = [];
    cookieStrs.forEach((cookieStr) => {
        cookieComps = cookieStr.split('=');
        cookies.set(cookieComps[0].trim(), cookieComps[1].trim());
    });

    return cookies;
}

/*****************************Exports********************/
export {emailRegex, getCookies};