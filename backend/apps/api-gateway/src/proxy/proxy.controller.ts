import {
  All,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role } from '@app/common';


const TARGETS: Record<string, string> = {
  pelanggaran: process.env.SERVICE_PELANGGARAN_URL!,
  profile: process.env.SERVICE_PROFILE_URL!,
  berita: process.env.SERVICE_BERITA_URL!,
  portofolio: process.env.SERVICE_PORTOFOLIO_URL!,
  management: process.env.SERVICE_MANAGEMENT_URL!,
};

@Controller('api')
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  private proxyBody(proxyReq: any, req: Request) {
    if (!req.body || Object.keys(req.body).length === 0) {
      return;
    }

    const contentType = req.headers['content-type'] ?? '';
    const isJson = Array.isArray(contentType)
      ? contentType.some((value) => value.includes('application/json'))
      : contentType.includes('application/json');

    if (!isJson) {
      return;
    }

    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }

  private mapPathForService(service: string, path: string): string {
    if (service === 'portofolio' && path.includes('/uploads/')) {
      // Strip '/api/portofolio' agar cocok dengan path static di service-portofolio
      return path.replace('/api/portofolio', '');
    }

    if (service === 'berita' || service === 'portofolio') {
      return path;
    }

    const gatewayBase = `/api/${service}`;
    const rest = path.startsWith(gatewayBase)
      ? path.slice(gatewayBase.length)
      : path;

    if (service === 'profile' && rest.startsWith('/uploads')) {
      return rest;
    }

    if (service === 'management' && rest.startsWith('/uploads')) {
      return rest;
    }

    if (rest === '' || rest === '/') return '/api';
    if (rest.startsWith('/api')) return rest;

    return `/api${rest}`;
  }

  /* =========================
     PELANGGARAN
  ========================= */
  @All('pelanggaran')
  @Roles(Role.ADMIN)
  proxyPelanggaranRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('pelanggaran', req, res);
  }

  @All([
    'pelanggaran/surat-panggilan',
    'pelanggaran/surat-panggilan/:id',
    'pelanggaran/surat-panggilan/master/siswa',
    'pelanggaran/surat-panggilan/master/guru',
    'pelanggaran/surat-panggilan/:id/pdf',
    'pelanggaran/surat-panggilan/:id/whatsapp',
    'pelanggaran/surat-panggilan/:id/selesai',
    'pelanggaran/surat-panggilan/:id/batalkan',
  ])
  @Roles(Role.ADMIN)
  proxyPelanggaranSuratPanggilan(@Req() req: Request, @Res() res: Response) {
    return this.forward('pelanggaran', req, res);
  }

  @All('pelanggaran/*path')
  @Roles(Role.ADMIN)
  proxyPelanggaranFallback(@Req() req: Request, @Res() res: Response) {
    return this.forward('pelanggaran', req, res);
  }

  /* =========================
   PROFILE (public read)
========================= */
@Get('profile')
@Public()
proxyProfileRoot(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

@Get('profile/uploads/*path')
@Public()
proxyProfileUploads(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

@Get('profile/*path')
@Public()
proxyProfileRead(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

/* =========================
   PROFILE (admin only write)
========================= */
@Post('profile')
@Roles(Role.ADMIN)
proxyProfileCreateRoot(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

@Post('profile/*path')
@Roles(Role.ADMIN)
proxyProfileCreate(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

@Put('profile')
@Roles(Role.ADMIN)
proxyProfileUpdateRoot(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

@Put('profile/*path')
@Roles(Role.ADMIN)
proxyProfileUpdate(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

@Delete('profile')
@Roles(Role.ADMIN)
proxyProfileDeleteRoot(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

@Delete('profile/*path')
@Roles(Role.ADMIN)
proxyProfileDelete(@Req() req: Request, @Res() res: Response) {
  return this.forward('profile', req, res);
}

  /* =========================
     BERITA (public read, protected write)
  ========================= */
  @Get('berita')
  @Public()
  proxyBeritaRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Get('berita/*path')
  @Public()
  proxyBeritaRead(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('berita')
  @Roles(Role.ADMIN)
  proxyBeritaCreate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('berita/*path')
  @Roles(Role.ADMIN)
  proxyBeritaCreatePath(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('berita/*path')
  @Roles(Role.ADMIN, Role.GURU)
  proxyBeritaUpdate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('berita')
  @Roles(Role.ADMIN, Role.GURU)
  proxyBeritaUpdateRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('berita/*path')
  @Roles(Role.ADMIN)
  proxyBeritaDelete(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('berita')
  @Roles(Role.ADMIN)
  proxyBeritaDeleteRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  /* =========================
     CATEGORIES (public)
  ========================= */
  @Get('categories')
  @Public()
  proxyCategoriesRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Get('categories/*path')
  @Public()
  proxyCategories(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('categories')
  @Roles(Role.ADMIN)
  proxyCategoriesCreate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('categories/*path')
  @Roles(Role.ADMIN)
  proxyCategoriesCreatePath(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('categories/*path')
  @Roles(Role.ADMIN)
  proxyCategoriesUpdate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('categories')
  @Roles(Role.ADMIN)
  proxyCategoriesUpdateRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('categories/*path')
  @Roles(Role.ADMIN)
  proxyCategoriesDelete(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('categories')
  @Roles(Role.ADMIN)
  proxyCategoriesDeleteRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  /* =========================
     PENGUMUMAN (public)
  ========================= */
  @Get('pengumuman')
  @Public()
  proxyPengumumanRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Get('pengumuman/*path')
  @Public()
  proxyPengumuman(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('pengumuman')
  @Roles(Role.ADMIN)
  proxyPengumumanCreate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('pengumuman/*path')
  @Roles(Role.ADMIN)
  proxyPengumumanCreatePath(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('pengumuman/*path')
  @Roles(Role.ADMIN)
  proxyPengumumanUpdate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('pengumuman')
  @Roles(Role.ADMIN)
  proxyPengumumanUpdateRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('pengumuman/*path')
  @Roles(Role.ADMIN)
  proxyPengumumanDelete(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('pengumuman')
  @Roles(Role.ADMIN)
  proxyPengumumanDeleteRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  /* =========================
     AGENDA (public)
  ========================= */
  @Get('agenda')
  @Public()
  proxyAgendaRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Get('agenda/*path')
  @Public()
  proxyAgenda(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('agenda')
  @Roles(Role.ADMIN)
  proxyAgendaCreate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Post('agenda/*path')
  @Roles(Role.ADMIN)
  proxyAgendaCreatePath(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('agenda/*path')
  @Roles(Role.ADMIN)
  proxyAgendaUpdate(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Put('agenda')
  @Roles(Role.ADMIN)
  proxyAgendaUpdateRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('agenda/*path')
  @Roles(Role.ADMIN)
  proxyAgendaDelete(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Delete('agenda')
  @Roles(Role.ADMIN)
  proxyAgendaDeleteRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  /* =========================
     SEARCH (public)
  ========================= */
  @Get('search')
  @Public()
  proxySearch(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  @Get('search/*path')
  @Public()
  proxySearchPath(@Req() req: Request, @Res() res: Response) {
    return this.forward('berita', req, res);
  }

  /* =========================
     PORTOFOLIO (read public)
  ========================= */
  @Get('portofolio')
  @Public()
  proxyPortofolioRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Get('portofolio/me')
  @Roles(Role.SISWA)
  proxyPortofolioMine(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Get('portofolio/review')
  @Roles(Role.ADMIN)
  proxyPortofolioReview(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Get('portofolio/uploads/*path')
  @Public()
  proxyPortofolioUploads(@Req() req: Request, @Res() res: Response) {
      return this.forward('portofolio', req, res);
  }

  @Get('portofolio/:id')
  @Public()
  proxyPortofolioDetail(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  /* =========================
     PORTOFOLIO (write auth)
  ========================= */
  @Post('portofolio')
  @Roles(Role.SISWA)
  proxyPortofolioCreate(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Put('portofolio/:id/submit')
  @Roles(Role.SISWA)
  proxyPortofolioSubmit(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Put('portofolio/:id/publish')
  @Roles(Role.ADMIN)
  proxyPortofolioPublish(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Put('portofolio/:id/reject')
  @Roles(Role.ADMIN)
  proxyPortofolioReject(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Put('portofolio/*path')
  @Roles(Role.SISWA)
  proxyPortofolioUpdate(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  @Delete('portofolio/*path')
  @Roles(Role.SISWA)
  proxyPortofolioDelete(@Req() req: Request, @Res() res: Response) {
    return this.forward('portofolio', req, res);
  }

  /* =========================
     MANAGEMENT (admin only)
  ========================= */

  /** Siswa hanya boleh melihat dan mengunduh dokumen miliknya sendiri. */
  @Get('management/siswa/saya')
  @Roles(Role.SISWA)
  proxySiswaSaya(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Get('management/siswa/saya/download/:type')
  @Roles(Role.SISWA)
  proxySiswaSayaDownload(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Get('management/siswa/saya/dokumen/:dokumenId')
  @Roles(Role.SISWA)
  proxySiswaSayaDokumen(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  /** Guru boleh melihat daftar siswa serta mengunggah rapor, SKL, dan ijazah. */
  @Get('management/siswa')
  @Roles(Role.ADMIN, Role.GURU)
  proxySiswaList(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Get('management/siswa/search')
  @Roles(Role.ADMIN, Role.GURU)
  proxySiswaSearch(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Post('management/siswa/:id/upload/:type')
  @Roles(Role.ADMIN, Role.GURU)
  proxySiswaUpload(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Get('management/siswa/:id/dokumen')
  @Roles(Role.ADMIN, Role.GURU)
  proxySiswaDokumenList(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Get('management/siswa/:id/dokumen/:dokumenId')
  @Roles(Role.ADMIN, Role.GURU)
  proxySiswaDokumenLihat(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Delete('management/siswa/:id/dokumen/:dokumenId')
  @Roles(Role.ADMIN, Role.GURU)
  proxySiswaDokumenHapus(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @Get('management/siswa/:id/download/:type')
  @Roles(Role.ADMIN, Role.GURU)
  proxySiswaDownload(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  /* =========================
     SKL DRIVE (PENYIMPANAN SKL G-DRIVE STYLE)
  ========================= */
  @All([
    'management/skl',
    'management/skl/*path',
  ])
  @Roles(Role.ADMIN, Role.GURU)
  proxySklDrive(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @All('management')
  @Roles(Role.ADMIN)
  proxyManagementRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  @All('management/*path')
  @Roles(Role.ADMIN)
  proxyManagement(@Req() req: Request, @Res() res: Response) {
    return this.forward('management', req, res);
  }

  /* =========================
     CORE FORWARD FUNCTION
  ========================= */
  private forward(service: string, req: Request, res: Response) {
    const target = TARGETS[service];
    const user = (req as any).user;

    this.logger.log(
      `→ [${req.method}] ${req.url} | user=${user?.sub} roles=[${user?.roles}]`,
    );

    const opts: Options = {
      target,
      changeOrigin: true,
      pathRewrite: (path) => this.mapPathForService(service, path),

      on: {
        proxyReq: (proxyReq) => {
          /** 🔥 Forward JWT (IMPORTANT) */
          if (req.headers.authorization) {
            proxyReq.setHeader(
              'Authorization',
              req.headers.authorization,
            );
          }

          /** 🔥 Optional user headers */
          if (process.env.INTERNAL_GATEWAY_SECRET) {
            proxyReq.setHeader(
              'X-Gateway-Secret',
              process.env.INTERNAL_GATEWAY_SECRET,
            );
          }

          if (user) {
            proxyReq.setHeader('X-User-Id', user.sub ?? '');
            proxyReq.setHeader('X-User-Name', user.username ?? '');
            proxyReq.setHeader('X-User-Roles', (user.roles ?? []).join(','));
          }

          this.proxyBody(proxyReq, req);
        },

        error: (_err, _req, proxyRes: any) => {
          this.logger.error(`Service "${service}" unavailable`);

          proxyRes.status(502).json({
            statusCode: 502,
            message: `Service tidak tersedia: ${service}`,
          });
        },
      },
    };

    return createProxyMiddleware(opts)(req, res, () => {});
  }
}
