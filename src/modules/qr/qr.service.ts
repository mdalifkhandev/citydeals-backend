import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import QRCode from 'qrcode';

@Injectable()
export class QrService {
  constructor(private readonly configService: ConfigService) {}

  async generateAreaQrCode(slug: string): Promise<string> {
    const baseUrl = this.configService.get<string>('app.publicBaseUrl');
    const directoryUrl = `${baseUrl}/directory/${slug}`;
    const dataUrl = await QRCode.toDataURL(directoryUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 1200,
    });
    return this.uploadQrAsset(slug, dataUrl);
  }

  private async uploadQrAsset(slug: string, dataUrl: string): Promise<string> {
    if (process.env.S3_PUBLIC_BASE_URL) {
      return `${process.env.S3_PUBLIC_BASE_URL}/qr/areas/${slug}.png`;
    }
    return dataUrl;
  }
}
