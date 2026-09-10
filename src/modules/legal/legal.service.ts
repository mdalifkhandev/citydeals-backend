import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  async getTerms() {
    const terms = await this.prisma.legalDocument.findUnique({ where: { type: 'TERMS_OF_USE' } });
    return terms ?? {
      type: 'TERMS_OF_USE',
      title: 'Terms of Use',
      version: '1.0',
      content: 'Terms of Use content will be managed from the admin panel.',
    };
  }
}
