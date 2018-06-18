const request = require('request');
module.exports = function (options) {
  const { AUTH_SERVER, emailPostfix, key, sysCode } = options;

  this.bindHook('third_login', (ctx) => {
    const ticket = ctx.cookies.get('operator_ticket');
    const signKey = `sysCode=${sysCode}&ticket=${ticket}&key=${key}`;
    const md5 = require('crypto').createHash('md5');
    const sign = md5.update(signKey).digest('hex').toLocaleUpperCase();
    const requestUrl = AUTH_SERVER + '?ticket=' + ticket + '&sysCode=ams&sign=' + sign;
    return new Promise((resolve, reject) => {
      if (!ticket) reject({ message: '登录失败啦,客官' });
      request(requestUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          let result = JSON.parse(body);
          if (result && result.ret === true && result.data) {
            let ret = {
              email: result.data.uid + emailPostfix,
              username: result.data.cnName
            };
            resolve(ret);
          } else {
            reject(result);
          }
        }
        reject(error);
      });
    });
  })
}