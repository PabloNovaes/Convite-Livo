// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/visitante', '/admin'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token');

    const isProtected = protectedRoutes.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Limita onde o middleware roda
export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
