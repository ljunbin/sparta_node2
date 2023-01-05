const express = require("express");
const app = express();

const models = require('./models');
const { sequelize } = require('./models');
const routesConnect = require('./routes/index');


app.use(express.json());
app.use(express.static("assets"));
app.use('/', routesConnect);


async function main() {
  await sequelize.sync;
}
main();
models.sequelize
  .sync()
  .then(() => {
    console.log(' DB 연결 성공');
  })
  .catch((err) => {
    console.log('연결 실패');
    console.log(err);
  });


app.listen(8080, () => {
    console.log("서버가 요청을 받을 준비가 됐어요");
});