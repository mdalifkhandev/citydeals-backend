import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? 'jynnshnm',
  apiKey: process.env.CLOUDINARY_API_KEY ?? '332732283241628',
  apiSecret: process.env.CLOUDINARY_API_SECRET ?? 'Lb1TIml_ZRbJZh0XZfu77VkZBec',
  url: process.env.CLOUDINARY_URL ?? 'cloudinary://332732283241628:Lb1TIml_ZRbJZh0XZfu77VkZBec@jynnshnm',
}));
