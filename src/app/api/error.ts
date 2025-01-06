'use client'

import { NextResponse } from 'next/server';
import { AppError } from '@/types/errors';
import logger from '@/utils/logger';

export function handleApiError(error: unknown) {
  logger.error('API Error:', { error });

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

export function handleServerError(error: unknown) {
  console.error('Server error:', error)
  return new NextResponse(
    JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
} 