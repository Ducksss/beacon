import 'server-only';
import { NextResponse } from 'next/server';
import {
  isPublicDemoMode,
  PUBLIC_DEMO_PRIVATE_METADATA_MESSAGE,
  PUBLIC_DEMO_READ_ONLY_MESSAGE,
} from '@/lib/public-demo';

export function getPublicDemoReadOnlyResponse() {
  if (!isPublicDemoMode()) {
    return null;
  }

  return NextResponse.json(
    { error: PUBLIC_DEMO_READ_ONLY_MESSAGE },
    { status: 403 }
  );
}

export function getPublicDemoPrivateMetadataResponse() {
  if (!isPublicDemoMode()) {
    return null;
  }

  return NextResponse.json(
    { error: PUBLIC_DEMO_PRIVATE_METADATA_MESSAGE },
    { status: 403 }
  );
}
