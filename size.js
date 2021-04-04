const path = require("path");
const fsPrm = require("fs").promises;
const fs = require("fs");
const sharp = require("sharp");
const sizeOf = require("image-size");

// sharp(imagePath)
//   .extend({
//     left: 50,
//     right: 50,
//     background: { r: 0, g: 0, b: 0, alpha: 0.01 },
//   })
//   .toFile("./Stickers/sharp_extend.png");

// 파일 디렉토리 확인
// 디렉토리 순환
//  ㄴ taget 하위에 사이징 디렉토리 생성
//  ㄴ 디랙토리 내에서 이미지 리스트 확인
//  ㄴ 이미지 순환
//      ㄴ 이미지 별 사이즈 확인
//      ㄴ 이미지 변경
//      ㄴ 이미지명 + w512 + 확장자 로 이미지 생성
//      ㄴ 사이징 디렉토리로 이동

const stickerRoot = "./Stickers";
const sizingRoot = `${stickerRoot}/_sizing`;

function mapAsync(array, callback) {
  return Promise.all(array.map(callback));
}

async function filterAsync(array, callback) {
  const filterMap = await mapAsync(array, callback);
  return array.filter((_, index) => filterMap[index]);
}

(async () => {
  const stickerPack = await filterAsync(
    await fsPrm.readdir(stickerRoot),
    async (target) => {
      const dir = `${stickerRoot}/${target}`;
      const stat = await fsPrm.lstat(dir);

      return dir !== sizingRoot && stat.isDirectory();
    }
  );

  await mapAsync(stickerPack, async (sticker) => {
    const sizingDir = `${sizingRoot}/${sticker}`;
    const stickerDir = `${stickerRoot}/${sticker}`;

    const exist = await fs.existsSync(sizingDir);
    !exist && (await fs.mkdirSync(sizingDir));

    const stickerList = await fs.readdirSync(stickerDir);

    stickerList.map((file) => {
      const resource = `${stickerDir}/${file}`;
      const { width, type } = sizeOf(resource);
      const ext = path.extname(file);
      const name = path.basename(file, ext);

      sharp(resource)
        .resize({
          height: 200,
          width: 512,
          fit: "contain",
          position: "left",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toFile(`${sizingDir}/${name}_w512.${type}`)
        .then(() => {
          console.log(`${resource} finish`);
        });
    });
  });
})().catch(console.error);
