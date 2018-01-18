const axios = require('axios');
const isCool = num => {
  const getCoolness = n => {
    const nums = [...`${n}`];
    const reducted = nums.reduce((t, e) => t + e * e, 0);
    if (reducted === 1) {
      return true;
    } else if (reducted === 4) {
      return false;
    } else {
      return getCoolness(reducted);
    }
  };
  return getCoolness(num);
};

let res = 0;

for (let i = 1; i < 1000001; i++) {
  const cool = isCool(i);
  if (cool) res += i;
}

console.log(res);
let code = {};
let errors = 0;
const getCodes = async i => {
  try {
    const response = await axios.post(
      `http://dev.getethos.com/code${i}`,
      {},
      {
        headers: { 'X-COOL-SUM': `${res}` }
      }
    );
    code[i] = response.data;
    const codeString = Object.keys(code)
      .map(k => code[k])
      .join('');
    console.log(codeString);
  } catch (error) {
    errors++;
  }
};

for (let i = 1; i < 101; i++) {
  (async function() {
    await getCodes(i);
  })();
}
