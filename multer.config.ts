// // muler.config.ts
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// export const multerConfig = (function () {
//   const serverType = process.env.SERVER_TYPE;
//   console.log('server', process.env.SERVER_TYPE);
//   if (serverType !== 'multer') {
//     return {};
//   } else {
//     return {
//       storage: diskStorage({
//         destination: './uploads',
//         filename: (req, file, callback) => {
//           console.log('asdfasdfsdafsdd');
//           const uniqueSuffix =
//             Date.now() + '-' + Math.round(Math.random() * 1e9);
//           const extension = extname(file.originalname);
//           callback(null, file.fieldname + '-' + uniqueSuffix + extension);
//         },
//       }),
//     };
//   }
// })();
